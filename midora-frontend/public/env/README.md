# Studio environment asset

`studio_small_09_1k.hdr` is a 1K Radiance HDR environment from **Poly Haven**,
licensed **CC0 (public domain)**.

- Source: https://polyhaven.com/a/studio_small_09
- Download: https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr

It is used by `src/features/avatar/three/studioEnvironment.ts` as the image-based
lighting source for the avatar viewport. If the file is removed, the viewport
falls back to three.js `RoomEnvironment` automatically (no crash, just flatter
lighting).
