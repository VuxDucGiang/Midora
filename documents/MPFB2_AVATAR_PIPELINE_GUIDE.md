# Hướng dẫn Pipeline 3D Avatar MPFB2 (MakeHuman CC0) + GLB Morph Targets

Tài liệu này mô tả luồng sản xuất file `.glb` người thật chuẩn nhân trắc học (**Phương án A**) để ghép trực tiếp vào [`Avatar3DCanvas.tsx`](../midora-frontend/src/features/avatar/components/Avatar3DCanvas.tsx) mà **không cần sửa code frontend**.

---

## 1. Kiến trúc Runtime đã tích hợp sẵn trong `midora-frontend`

```text
/models/avatar-manifest.json
   ├── enabled: false ──▶ Dùng OrganicMannequinRig (đã nâng cấp tỷ lệ ANSUR II phi tuyến,
   │                       xương đòn, hõm lưng, bàn tay 2 khối, da MeshPhysicalMaterial + đồ lót studio)
   └── enabled: true  ──▶ Tự động tải GLB qua GLTFLoader + MeshoptDecoder + DRACOLoader + KTX2Loader
                           └── GlbMorphAvatarRig + solveGlbBodyControls()
                                ├── Ánh xạ chest/waist/hips/shoulder/weight → Morph Target Influences
                                ├── Scale xương chân/lưng phi tuyến (bù tỷ lệ đầu để đầu không bị phóng to)
                                └── Giữ nguyên vòng thước đo Tobacco & thanh chiều cao
```

Các file cốt lõi đã xây dựng:
- Hợp đồng & loại rig: [`avatarRigTypes.ts`](../midora-frontend/src/features/avatar/three/avatarRigTypes.ts)
- Bộ giải tỷ lệ nhân trắc học & trọng số Morph/Bone: [`bodyCalibration.ts`](../midora-frontend/src/features/avatar/three/bodyCalibration.ts)
- Bộ nạp GLB + Meshopt/Draco/KTX2: [`avatarLoader.ts`](../midora-frontend/src/features/avatar/three/avatarLoader.ts)
- Bộ điều khiển Avatar GLB: [`GlbMorphAvatarRig.ts`](../midora-frontend/src/features/avatar/three/GlbMorphAvatarRig.ts)
- Vòng thước đo 3D dùng chung: [`MeasurementOverlayRig.ts`](../midora-frontend/src/features/avatar/three/MeasurementOverlayRig.ts)
- Script Blender tự động hóa + đo chu vi vòng đỉnh: [`mpfb2_generate_midora_avatar.py`](../midora-frontend/scripts/mpfb2_generate_midora_avatar.py)

---

## 2. Quy trình tạo file `.glb` người thật bằng Blender + MPFB2 (Bản quyền CC0)

### Bước 1: Cài Blender & Extension MPFB2
1. Tải **Blender 4.2 LTS** (hoặc mới hơn) từ `blender.org`.
2. Mở Blender → `Edit > Preferences > Get Extensions` → tìm **MPFB2** (*MakeHuman Plugin for Blender*) và bấm **Install**.
   > Toàn bộ base mesh, rig và target biến dạng cốt lõi của MakeHuman dùng giấy phép **CC0 (Public Domain)**, hoàn toàn hợp pháp để triển khai thương mại trên sàn MIDORA.

### Bước 2: Chạy script tự động sinh Female & Male GLB + Bảng hiệu chuẩn cm
Chạy lệnh từ thư mục gốc repository `Midora`:

```powershell
blender --background --python midora-frontend/scripts/mpfb2_generate_midora_avatar.py -- --output midora-frontend/public/models
```

Script này sẽ tự động thực hiện 5 công việc:
1. Khởi tạo base mesh Nữ & Nam ở tư thế **A-pose** (~38°).
2. Nạp và đóng gói 10 Shape Keys chuẩn hai chiều dương `[0..1]` (`chest_girth_plus/minus`, `waist_girth_plus/minus`, `hip_girth_plus/minus`, `shoulder_width_plus/minus`, `body_weight_plus/minus`).
3. Gắn bộ xương `game_engine` gọn nhẹ và material PBR chuẩn glTF 2.0.
4. Cắt mặt phẳng ngang tại 4 mốc (`hips`, `waist`, `chest`, `shoulder`) bằng `bmesh.ops.bisect_plane` để đo **chu vi thật theo từng cm**, loại bỏ cánh tay và ghi dải min/neutral/max vào `avatar-manifest.json`.
5. Xuất 2 file `midora-avatar-female.glb`, `midora-avatar-male.glb` và tự bật `"enabled": true` trong [`avatar-manifest.json`](../midora-frontend/public/models/avatar-manifest.json).

### Bước 3 (Khuyên dùng Production): Nén Meshopt để giữ nguyên Morph Targets
> Lưu ý: **Draco** không hỗ trợ nén Morph Targets; hãy dùng **Meshopt** vì giữ nguyên Shape Keys + Skeleton và giải nén cực nhanh trong trình duyệt (`MeshoptDecoder` đã được bật sẵn trong [`avatarLoader.ts`](../midora-frontend/src/features/avatar/three/avatarLoader.ts)).

```bash
npm install -g @gltf-transform/cli
gltf-transform meshopt midora-frontend/public/models/midora-avatar-female.glb midora-frontend/public/models/midora-avatar-female.glb --level medium
gltf-transform meshopt midora-frontend/public/models/midora-avatar-male.glb midora-frontend/public/models/midora-avatar-male.glb --level medium
```

---

## 3. Quy ước tên Shape Keys & Hair Nodes nếu bạn tự sculpt bằng tay trong Blender

Nếu bạn tự tinh chỉnh hoặc thêm quần áo / kiểu tóc vào file `.glb`, chỉ cần đặt đúng các tên sau để [`GlbMorphAvatarRig.ts`](../midora-frontend/src/features/avatar/three/GlbMorphAvatarRig.ts) tự động nhận diện:

- **Shape Keys (0.0 → 1.0)**:
  - `chest_girth_plus`, `chest_girth_minus`
  - `waist_girth_plus`, `waist_girth_minus`
  - `hip_girth_plus`, `hip_girth_minus`
  - `shoulder_width_plus`, `shoulder_width_minus`
  - `body_weight_plus`, `body_weight_minus`
  - Tùy chọn cho Unisex: `gender_female`, `gender_male`
- **Mesh Tóc tùy chọn** (tự ẩn/hiện theo `hairStyle`):
  - Chứa chuỗi `Hair_Short`, `Hair_Bob`, `Hair_Long`.
- **Material Skin**: Đặt tên chứa `Skin` hoặc `Body` để Three.js tự động áp dụng `MeshPhysicalMaterial` (`sheen`) và đổi tông da / chế độ `Vải Linen` mượt mà.

