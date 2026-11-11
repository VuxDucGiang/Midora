"""
MIDORA - Blender 4.x + MPFB2 (MakeHuman CC0) Avatar Generator & Anthropometric Calibrator

Generates anatomically realistic Female & Male GLB avatars with calibrated Morph Targets
(Shape Keys) + Game-Engine Skeletal Rig, measures exact vertex-loop body circumferences
in centimeters, and writes midora-frontend/public/models/avatar-manifest.json.

Usage (headless):
  blender --background --python midora-frontend/scripts/mpfb2_generate_midora_avatar.py -- \
    --output midora-frontend/public/models
"""

import argparse
import importlib
import json
import math
import os
import sys
from collections import defaultdict, deque

import bmesh
import bpy


# Target presets searched across MPFB2's installed MakeHuman target library.
# Each MIDORA morph pair defines target fragments to apply for +1 and -1 extremes.
MIDORA_MORPH_DEFINITIONS = {
    "chest_girth_plus": [
        ("torso/torso-scale-horiz-incr", 0.7),
        ("breast/Female-breast-size-incr", 0.35),
    ],
    "chest_girth_minus": [
        ("torso/torso-scale-horiz-decr", 0.7),
        ("breast/Female-breast-size-decr", 0.25),
    ],
    "waist_girth_plus": [
        ("stomach/stomach-scale-horiz-incr", 0.8),
        ("torso/torso-scale-depth-incr", 0.45),
    ],
    "waist_girth_minus": [
        ("stomach/stomach-scale-horiz-decr", 0.8),
        ("torso/torso-scale-depth-decr", 0.45),
    ],
    "hip_girth_plus": [
        ("hip/hip-scale-horiz-incr", 0.85),
        ("buttocks/buttocks-volume-incr", 0.5),
    ],
    "hip_girth_minus": [
        ("hip/hip-scale-horiz-decr", 0.85),
        ("buttocks/buttocks-volume-decr", 0.45),
    ],
    "shoulder_width_plus": [
        ("shoulders/shoulders-width-incr", 0.9),
    ],
    "shoulder_width_minus": [
        ("shoulders/shoulders-width-decr", 0.9),
    ],
    "body_weight_plus": [
        ("macrodetails/universal-female-heavy", 0.65),
        ("arms/upperarm-volume-incr", 0.45),
        ("legs/thigh-volume-incr", 0.45),
    ],
    "body_weight_minus": [
        ("macrodetails/universal-female-skinny", 0.65),
        ("arms/upperarm-volume-decr", 0.45),
        ("legs/thigh-volume-decr", 0.45),
    ],
}


def dynamic_import_mpfb(module_suffix: str, symbol: str):
    """Safely resolves MPFB2 internal service classes inside Blender Extensions."""
    for mod_name in list(sys.modules.keys()):
        if mod_name.endswith(module_suffix):
            mod = importlib.import_module(mod_name)
            if hasattr(mod, symbol):
                return getattr(mod, symbol)
    raise RuntimeError(
        f"Could not find MPFB2 symbol '{symbol}' in '{module_suffix}'. "
        "Please enable the MPFB2 extension in Blender Preferences."
    )


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (bpy.data.meshes, bpy.data.materials, bpy.data.armatures):
        for item in list(collection):
            if item.users == 0:
                collection.remove(item)


def spawn_mpfb_human(gender: str):
    """Creates a clean neutral MPFB2 human basemesh configured for Female or Male proportions."""
    bpy.ops.mpfb.create_human_from_scratch()
    human_obj = bpy.context.active_object
    if human_obj is None or human_obj.type != "MESH":
        for obj in bpy.context.scene.objects:
            if obj.type == "MESH" and ("Human" in obj.name or obj.get("IS_MAKEHUMAN_HUMAN")):
                human_obj = obj
                break
    if human_obj is None:
        raise RuntimeError("Failed to locate spawned MPFB2 human mesh.")

    bpy.context.view_layer.objects.active = human_obj
    human_obj.select_set(True)

    # Set gender phenotype slider when present in MPFB shape keys
    if human_obj.data.shape_keys:
        keys = human_obj.data.shape_keys.key_blocks
        gender_target = 0.0 if gender == "female" else 1.0
        for kb in keys:
            lname = kb.name.lower()
            if "gender" in lname and "male" in lname:
                kb.value = gender_target
            elif "gender" in lname and "female" in lname:
                kb.value = 1.0 - gender_target

    return human_obj


def bake_midora_shape_keys(human_obj):
    """
    Rebuilds a clean, lightweight set of MIDORA positive [0..1] Shape Keys on top of Basis
    by evaluating MPFB2 target offsets. Keeps the glTF export fast & compact.
    """
    TargetService = dynamic_import_mpfb("mpfb.services.targetservice", "TargetService")
    SystemService = dynamic_import_mpfb("mpfb.services.systemservice", "SystemService")

    target_root = SystemService.get_sys_data_path("targets")
    available_targets = []
    if target_root and os.path.isdir(target_root):
        for root_dir, _, files in os.walk(target_root):
            for fname in files:
                if fname.endswith(".target") or fname.endswith(".target.gz"):
                    full = os.path.join(root_dir, fname)
                    rel = os.path.relpath(full, target_root).replace("\\", "/")
                    available_targets.append((rel.lower(), full))

    # Ensure Basis shape key exists
    if not human_obj.data.shape_keys:
        human_obj.shape_key_add(name="Basis", from_mix=False)

    mesh = human_obj.data
    existing_keys = {k.name for k in mesh.shape_keys.key_blocks}

    for key_name, recipe in MIDORA_MORPH_DEFINITIONS.items():
        if key_name in existing_keys:
            continue

        # Snapshot neutral Basis coordinates
        basis = mesh.shape_keys.key_blocks["Basis"]
        neutral_coords = [v.co.copy() for v in basis.data]
        delta_accum = [neutral_coords[i].copy() for i in range(len(neutral_coords))]

        loaded_any = False
        for target_fragment, weight in recipe:
            frag_lower = target_fragment.lower()
            matched = next((full for rel, full in available_targets if frag_lower in rel), None)
            if not matched:
                continue

            temp_name = f"__tmp_{os.path.basename(matched)}"
            try:
                TargetService.load_target(human_obj, matched, name=temp_name)
                kb = mesh.shape_keys.key_blocks.get(temp_name)
                if kb is not None:
                    loaded_any = True
                    for idx, item in enumerate(kb.data):
                        delta_accum[idx] += (item.co - neutral_coords[idx]) * weight
                    human_obj.shape_key_remove(kb)
            except Exception as err:
                print(f"[MIDORA] Skipped target '{target_fragment}': {err}")

        if loaded_any:
            new_kb = human_obj.shape_key_add(name=key_name, from_mix=False)
            for idx, co in enumerate(delta_accum):
                new_kb.data[idx].co = co
            new_kb.slider_min = 0.0
            new_kb.slider_max = 1.0
            new_kb.value = 0.0
            print(f"[MIDORA] Created calibrated shape key '{key_name}'")


def attach_game_engine_rig(human_obj):
    """Attaches MPFB2's lightweight game_engine skeleton compatible with Three.js & GLTF."""
    try:
        RigService = dynamic_import_mpfb("mpfb.services.rigservice", "RigService")
        rig = RigService.add_builtin_rig(human_obj, "game_engine")
        if rig:
            # Set comfortable ~40 deg A-pose on arms so garments drape naturally
            bpy.context.view_layer.objects.active = rig
            bpy.ops.object.mode_set(mode="POSE")
            for bname, angle_deg in (("upperarm_l", -38.0), ("upperarm_r", 38.0)):
                pbone = rig.pose.bones.get(bname)
                if pbone:
                    pbone.rotation_mode = "XYZ"
                    pbone.rotation_euler[1] = math.radians(angle_deg)
            bpy.ops.object.mode_set(mode="OBJECT")
            return rig
    except Exception as err:
        print(f"[MIDORA] Could not attach MPFB2 game_engine rig automatically: {err}")
    return None


def setup_game_engine_pbr_skin(human_obj):
    """Ensures skin uses standard Principled BSDF materials safe for glTF 2.0 export."""
    try:
        bpy.ops.mpfb.create_skin_material()
    except Exception:
        pass

    if not human_obj.data.materials:
        mat = bpy.data.materials.new(name="Midora_Body_Skin")
        mat.use_nodes = True
        human_obj.data.materials.append(mat)
    else:
        for slot in human_obj.material_slots:
            if slot.material:
                slot.material.name = f"Midora_Skin_{slot.material.name}"


def measure_trunk_loop_cm(human_obj, z_ratio: float):
    """
    Slices the evaluated mesh at height `z_ratio` (0 = soles, 1 = vertex) in Blender Z-up space,
    isolates the trunk connected loop closest to centerline (x=0, y=0) to exclude arms,
    and returns (circumference_cm, lateral_width_cm).
    """
    depsgraph = bpy.context.evaluated_depsgraph_get()
    bm = bmesh.new()
    bm.from_object(human_obj, depsgraph)
    bm.transform(human_obj.matrix_world)

    zs = [v.co.z for v in bm.verts]
    if not zs:
        bm.free()
        return (0.0, 0.0)
    min_z, max_z = min(zs), max(zs)
    target_z = min_z + z_ratio * (max_z - min_z)

    res = bmesh.ops.bisect_plane(
        bm,
        geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
        plane_co=(0.0, 0.0, target_z),
        plane_no=(0.0, 0.0, 1.0),
    )

    cut_edges = [g for g in res["geom_cut"] if isinstance(g, bmesh.types.BMEdge)]
    if not cut_edges:
        bm.free()
        return (0.0, 0.0)

    # Build adjacency graph over cut vertices and pick connected component nearest torso center
    adj = defaultdict(list)
    for edge in cut_edges:
        v0, v1 = edge.verts[0], edge.verts[1]
        adj[v0].append((v1, edge))
        adj[v1].append((v0, edge))

    visited = set()
    components = []
    for start_v in adj.keys():
        if start_v in visited:
            continue
        comp_verts = []
        comp_edges = set()
        queue = deque([start_v])
        visited.add(start_v)
        while queue:
            cur = queue.popleft()
            comp_verts.append(cur)
            for nxt, edge in adj[cur]:
                comp_edges.add(edge)
                if nxt not in visited:
                    visited.add(nxt)
                    queue.append(nxt)
        avg_x = sum(v.co.x for v in comp_verts) / max(len(comp_verts), 1)
        components.append((abs(avg_x), comp_verts, comp_edges))

    components.sort(key=lambda item: item[0])
    _, trunk_verts, trunk_edges = components[0]

    perim_m = sum(e.calc_length() for e in trunk_edges)
    xs = [v.co.x for v in trunk_verts]
    width_m = (max(xs) - min(xs)) if xs else 0.0

    bm.free()
    return (round(perim_m * 100.0, 1), round(width_m * 100.0, 1))


def calibrate_model_spec(human_obj, gender: str, glb_rel_url: str):
    """Measures neutral & extreme morph target circumferences in cm for avatar-manifest.json."""
    shape_keys = human_obj.data.shape_keys.key_blocks if human_obj.data.shape_keys else None

    def reset_keys():
        if not shape_keys:
            return
        for kb in shape_keys:
            if kb.name.startswith(("chest_", "waist_", "hip_", "shoulder_", "body_weight_")):
                kb.value = 0.0

    def measure_with(key_name: str, weight: float, ratio: float, measure_width=False):
        reset_keys()
        if shape_keys and key_name in shape_keys:
            shape_keys[key_name].value = weight
        bpy.context.view_layer.update()
        perim_cm, width_cm = measure_trunk_loop_cm(human_obj, ratio)
        return width_cm if measure_width else perim_cm

    reset_keys()
    bpy.context.view_layer.update()

    # Read actual height in cm
    zs = [v.co.z for v in human_obj.data.vertices]
    height_cm = round((max(zs) - min(zs)) * 100.0, 1) if zs else (163.0 if gender == "female" else 175.0)

    r_hips = 0.515 if gender == "female" else 0.51
    r_waist = 0.625 if gender == "female" else 0.618
    r_chest = 0.728 if gender == "female" else 0.735
    r_shoulder = 0.818

    neutral_chest = measure_with("", 0.0, r_chest)
    neutral_waist = measure_with("", 0.0, r_waist)
    neutral_hips = measure_with("", 0.0, r_hips)
    neutral_shoulder = measure_with("", 0.0, r_shoulder, measure_width=True)

    chest_min = measure_with("chest_girth_minus", 1.0, r_chest) or (neutral_chest - 12.0)
    chest_max = measure_with("chest_girth_plus", 1.0, r_chest) or (neutral_chest + 24.0)
    waist_min = measure_with("waist_girth_minus", 1.0, r_waist) or (neutral_waist - 12.0)
    waist_max = measure_with("waist_girth_plus", 1.0, r_waist) or (neutral_waist + 30.0)
    hips_min = measure_with("hip_girth_minus", 1.0, r_hips) or (neutral_hips - 12.0)
    hips_max = measure_with("hip_girth_plus", 1.0, r_hips) or (neutral_hips + 26.0)
    sh_min = measure_with("shoulder_width_minus", 1.0, r_shoulder, True) or (neutral_shoulder - 5.0)
    sh_max = measure_with("shoulder_width_plus", 1.0, r_shoulder, True) or (neutral_shoulder + 7.5)

    reset_keys()

    return {
        "url": glb_rel_url,
        "neutralHeightCm": height_cm,
        "neutralWeightKg": 54.0 if gender == "female" else 69.0,
        "neutralMeasurements": {
            "chestCm": neutral_chest,
            "waistCm": neutral_waist,
            "hipsCm": neutral_hips,
            "shoulderWidthCm": neutral_shoulder,
        },
        "calibration": {
            "chestRangeCm": [min(chest_min, neutral_chest - 8), max(chest_max, neutral_chest + 18)],
            "waistRangeCm": [min(waist_min, neutral_waist - 8), max(waist_max, neutral_waist + 22)],
            "hipsRangeCm": [min(hips_min, neutral_hips - 8), max(hips_max, neutral_hips + 20)],
            "shoulderRangeCm": [min(sh_min, neutral_shoulder - 3.5), max(sh_max, neutral_shoulder + 6)],
        },
        "landmarksYRatio": {
            "hips": r_hips,
            "waist": r_waist,
            "chest": r_chest,
            "shoulder": r_shoulder,
        },
    }


def export_avatar_glb(output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format="GLB",
        export_yup=True,
        export_apply=False,
        export_morph=True,
        export_morph_normal=True,
        export_skins=True,
        export_def_bones=True,
        export_materials="EXPORT",
    )
    print(f"[MIDORA] Exported calibrated GLB -> {output_path}")


def main():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="midora-frontend/public/models")
    args = parser.parse_args(argv)

    out_dir = os.path.abspath(args.output)
    os.makedirs(out_dir, exist_ok=True)

    manifest = {
        "version": 1,
        "enabled": True,
        "notes": "Auto-generated & edge-loop calibrated by mpfb2_generate_midora_avatar.py",
        "models": {},
    }

    for gender in ("female", "male"):
        clear_scene()
        human_obj = spawn_mpfb_human(gender)
        bake_midora_shape_keys(human_obj)
        setup_game_engine_pbr_skin(human_obj)
        attach_game_engine_rig(human_obj)

        filename = f"midora-avatar-{gender}.glb"
        glb_path = os.path.join(out_dir, filename)
        spec = calibrate_model_spec(human_obj, gender, f"/models/{filename}")
        export_avatar_glb(glb_path)
        manifest["models"][gender] = spec

    manifest["models"]["neutral"] = manifest["models"]["female"]
    manifest_path = os.path.join(out_dir, "avatar-manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"[MIDORA] Wrote calibrated manifest -> {manifest_path}")


if __name__ == "__main__":
    main()

