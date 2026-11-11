# KẾ HOẠCH CHI TIẾT XÂY DỰNG BODY PROFILE & 3D AVATAR THÂN THIỆN NGƯỜI DÙNG

- **Dự án**: MIDORA – Digital Atelier for Vintage & Secondhand Fashion
- **Phạm vi**: Module Hồ sơ số đo (`body_profiles`) & Trình tạo Avatar 3D Tương tác (`src/features/avatar/`)
- **Mục tiêu cốt lõi**: Giúp người dùng phổ thông dễ dàng tạo được phiên bản 3D của chính mình trong dưới 30 giây, trực quan từng centimet và tạo cảm giác gần gũi, thẩm mỹ, đáng tin cậy.

---

## 1. TRIẾT LÝ THIẾT KẾ: LÀM SAO ĐỂ AVATAR 3D TRỰC QUAN & THÂN THIỆN?

Đa số tính năng thử đồ 3D thất bại ở 2 điểm: **(1) Bắt người dùng cầm thước dây tự đo 6-8 vòng cơ thể**, và **(2) Avatar nhìn như robot khối hộp cứng nhắc hoặc mô hình 3D quá tả thực gây cảm giác rờn rợn (Uncanny Valley)**.

MIDORA giải quyết bằng **5 nguyên tắc thiết kế UX/3D**:

### 1.1. "Smart Estimator" – Giảm 80% ma sát nhập liệu
- **Chế độ Nhập nhanh (Quick Setup – 10 giây)**: Người dùng chỉ cần:
  1. Chọn khung dáng cơ bản: **Nữ / Nam / Unisex**.
  2. Kéo 2 thông số ai cũng nhớ: **Chiều cao (cm)** & **Cân nặng (kg)**.
  3. Chọn **1 trong 5 hình thể trực quan (Body Shape Cards)**: *Mảnh mai (Slim)*, *Cân đối (Balanced)*, *Đồng hồ cát / Đầy đặn (Curvy)*, *Thể thao / Vai rộng (Athletic)*, *Thư thái (Relaxed)*.
- **Tự động ước lượng nhân trắc học (Anthropometric Formula)**: Từ chiều cao, cân nặng và dáng người, hệ thống tự động nội suy ra giá trị gợi ý hợp lý cho `chest_cm`, `waist_cm`, `hips_cm`, `shoulder_width_cm`.
- **Chế độ Tinh chỉnh (Fine-Tune)**: Người dùng có sẵn thước đo chuẩn để kéo từng centimet nếu muốn độ chính xác tuyệt đối (hoặc giữ nguyên kết quả ước lượng).

### 1.2. Thiết kế hình khối Avatar theo phong cách "Stylized Atelier Sculpture"
- **Tránh lỗi khối hộp robot**: Không ghép các hình trụ/hộp rời rạc. Thay vào đó, dựng phần thân (Torso: cổ $\rightarrow$ vai $\rightarrow$ ngực $\rightarrow$ eo $\rightarrow$ hông) bằng kỹ thuật **Organic Cross-Section Lofting (`BufferGeometry`)** nội suy đường cong mượt (Catmull-Rom / Superellipse) ở mỗi lát cắt chiều cao. Khi thông số ngực/eo/hông thay đổi, bề mặt cơ thể phồng/thon mượt mà như tượng điêu khắc.
- **Thẩm mỹ thân thiện, tránh Uncanny Valley**:
  - Tỷ lệ đầu–vai–tay–chân theo tỷ lệ giải phẫu người thật (~7.5 đầu), tư thế đứng thả lỏng tự nhiên kèm chuyển động hít thở cực nhẹ (*Idle Breathing Animation*) tạo cảm giác có sức sống.
  - Bổ sung tùy chọn **Tông màu cơ thể / Chất liệu** (5 tông da tự nhiên ấm áp hoặc chất liệu *Atelier Linen Mannequin* vải lanh sang trọng) và **Kiểu tóc tối giản (Stylized Hair)** thay vì đầu trọc ma-nơ-canh lạnh lẽo.

### 1.3. Phản hồi trực quan thời gian thực trên không gian 3D (Visual Feedback)
- **3D Glowing Measuring Rings (Vòng thước đo phát sáng)**: Khi người dùng hover hoặc đang kéo thanh trượt `Vòng eo`, một vòng thước đo màu Tobacco (`#A25B26`) lập tức hiện và ôm sát quanh vùng eo trên Avatar 3D, giãn nở đồng bộ với thanh trượt kèm nhãn số đo (`72 cm`). Nhìn là hiểu ngay mình đang chỉnh phần nào!
- **Atelier Backdrop & Height Ruler**: Phía sau Avatar là vạch chia chiều cao (cm) tinh tế và bóng đổ tiếp đất mềm mại, giúp mắt thường cảm nhận ngay vóc dáng cao/thấp thực tế.
- **Camera Presets 1 chạm**: Các nút xoay nhanh `Toàn thân`, `Thân trên`, `Nghiêng 45°`, `Mặt sau` bên cạnh thao tác kéo xoay 360° tự do.

### 1.4. Đa hồ sơ (Multi-Profile)
- Tận dụng sẵn cột `profile_name` và `is_default` trong bảng `body_profiles`: Người dùng có thể lưu nhiều hồ sơ (ví dụ: *"Dáng của tôi"*, *"Mua tặng mẹ"*, *"Mặc form rộng mùa đông"*) và đặt hồ sơ mặc định.

---

## 2. GITHUB AGENT SKILLS KHUYÊN DÙNG ĐỂ HỖ TRỢ XÂY DỰNG 3D

Dựa trên cơ chế quản lý skill hiện có của dự án (`skills-lock.json` dùng `npx skills add`), bạn nên cài thêm 2 bộ skill chuyên sâu về Three.js & WebGL từ GitHub:

| Repository GitHub | Lệnh cài đặt | Giá trị mang lại cho MIDORA 3D |
| :--- | :--- | :--- |
| **`CloudAI-X/threejs-skills`** | `npx skills add CloudAI-X/threejs-skills` | Bộ 10+ sub-skills chuyên sâu cho Three.js hiện đại: `threejs-geometry` (dựng `BufferGeometry` tùy biến cho thân người hữu cơ), `threejs-materials` & `threejs-lighting` (ánh sáng studio & PBR skin/fabric), `threejs-animation` (morph targets & breathing loop), `threejs-interaction` (OrbitControls mượt mà). |
| **`emalorenzo/three-agent-skills`** | `npx skills add emalorenzo/three-agent-skills` | Cung cấp `three-best-practices` (120+ quy tắc tối ưu hiệu năng WebGL, chống rò rỉ bộ nhớ GPU `dispose()`, tối ưu responsive canvas cho Next.js & mobile). |

> **Lưu ý kiến trúc**: Với React 19 + Next.js 16 hiện tại của MIDORA, sử dụng **Three.js thuần (`three` + `@types/three`)** quản lý trong React Client Component Canvas sẽ ổn định nhất, tránh xung đột peer-dependencies với React 19.

---

## 3. KIẾN TRÚC & KẾ HOẠCH BACKEND (`midora-backend`)

### 3.1. Database Contract (`body_profiles`)
Bám sát Flyway migration `V1__init_schema.sql`:
- `id` (`BIGINT PK`)
- `user_id` (`BIGINT FK -> users.id`)
- `profile_name` (`VARCHAR(100)`)
- `height_cm`, `weight_kg`, `chest_cm`, `waist_cm`, `hips_cm`, `shoulder_width_cm` (`FLOAT` -> Java `Float` để khớp tuyệt đối `ddl-auto=validate`)
- `avatar_customization_params` (`JSON`) — lưu cấu trúc:
  ```json
  {
    "genderStyle": "female",
    "bodyShape": "balanced",
    "skinTone": "#D8B49A",
    "hairStyle": "short_wave",
    "showMeasureRings": true
  }
  ```
- `is_default` (`BOOLEAN`)
- `created_at`, `updated_at` (`TIMESTAMP`)

### 3.2. Danh sách Files Backend cần triển khai (`com.midora.bodyprofile`)

1. **`dto/AvatarCustomizationParams.java`** (Java `record`):
   - `String genderStyle` (`female` | `male` | `neutral`)
   - `String bodyShape` (`slim` | `balanced` | `curvy` | `athletic` | `broad_shoulder`)
   - `String skinTone` (mã hex hợp lệ `#RRGGBB`)
   - `String hairStyle` (`none` | `short_clean` | `medium_bob` | `long_straight`)
2. **`entity/BodyProfile.java`**:
   - `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;`
   - Dùng `AttributeConverter<AvatarCustomizationParams, String>` sử dụng Jackson 3 `ObjectMapper` (hoặc `@JdbcTypeCode(SqlTypes.JSON)`) để đọc/ghi cột `JSON` an toàn 100% trên Spring Boot 4.1.2 + MySQL 8.
   - Các cột `FLOAT` dùng `Float` để khớp với `ddl-auto=validate`.
3. **`repository/BodyProfileRepository.java`**:
   - `List<BodyProfile> findByUserIdOrderByIsDefaultDescUpdatedAtDesc(Long userId);`
   - `Optional<BodyProfile> findByIdAndUserId(Long id, Long userId);` (đảm bảo ownership check).
   - `Optional<BodyProfile> findFirstByUserIdAndIsDefaultTrue(Long userId);`
   - `@Modifying @Query("UPDATE BodyProfile b SET b.isDefault = false WHERE b.user.id = :userId AND b.id <> :excludeId")` để đảm bảo chỉ có đúng 1 profile mặc định.
4. **`dto/request/BodyProfileRequest.java`** (Java `record` với Jakarta Validation):
   - `profileName`: `@NotBlank`, `@Size(max = 100)`
   - `heightCm`: `@NotNull`, `@DecimalMin("120.0")`, `@DecimalMax("220.0")`
   - `weightKg`: `@NotNull`, `@DecimalMin("30.0")`, `@DecimalMax("200.0")`
   - `chestCm`: `@NotNull`, `@DecimalMin("60.0")`, `@DecimalMax("160.0")`
   - `waistCm`: `@NotNull`, `@DecimalMin("45.0")`, `@DecimalMax("150.0")`
   - `hipsCm`: `@NotNull`, `@DecimalMin("65.0")`, `@DecimalMax("170.0")`
   - `shoulderWidthCm`: `@DecimalMin("30.0")`, `@DecimalMax("65.0")` (optional, auto-estimate nếu null)
   - `avatarCustomizationParams`: `@Valid AvatarCustomizationParams`
   - `isDefault`: `Boolean`
5. **`dto/response/BodyProfileResponse.java`** & **`mapper/BodyProfileMapper.java`**.
6. **`service/BodyProfileService.java` & `BodyProfileServiceImpl.java`**:
   - Nếu profile đầu tiên user tạo -> tự động set `isDefault = true`.
   - Nếu tạo/cập nhật với `isDefault = true` -> bỏ default của các profile khác cùng `userId`.
   - Mọi thao tác `getById`, `update`, `delete`, `setDefault` đều kiểm tra chặt `userId` sở hữu (nếu không tìm thấy hoặc sai chủ -> `404` / `403`).
7. **`controller/BodyProfileController.java`** (`/api/v1/body-profiles`):
   - `GET /body-profiles` — Danh sách tất cả hồ sơ của người dùng hiện tại.
   - `GET /body-profiles/default` — Lấy hồ sơ mặc định (trả về null hoặc 404 tùy xử lý).
   - `POST /body-profiles` — Tạo hồ sơ mới (trả `201 Created`).
   - `PUT /body-profiles/{id}` — Cập nhật số đo & tùy biến avatar.
   - `PATCH /body-profiles/{id}/default` — Đặt làm hồ sơ mặc định.
   - `DELETE /body-profiles/{id}` — Xóa hồ sơ (nếu xóa hồ sơ mặc định và còn hồ sơ khác, tự chuyển mặc định sang hồ sơ mới nhất).

---

## 4. KIẾN TRÚC & KẾ HOẠCH FRONTEND (`midora-frontend`)

### 4.1. Dependencies
- Cài đặt: `npm install three` và `npm install -D @types/three`.

### 4.2. Module & File Structure (`src/features/avatar/` + `src/types/` + `src/app/avatar/`)

1. **`src/types/bodyProfile.ts`**:
   - Mirror 100% DTO Backend: `GenderStyle`, `BodyShapePreset`, `HairStyle`, `AvatarCustomizationParams`, `BodyProfileResponse`, `BodyProfileRequest`.
2. **`src/features/avatar/utils/bodyEstimator.ts`** (Pure function):
   - Hàm `estimateBodyMetrics({ genderStyle, bodyShape, heightCm, weightKg })`:
     - Tính BMI = `weightKg / (heightM * heightM)`.
     - Dựa trên hệ số nhân trắc học theo giới tính & dáng người (Slim/Balanced/Curvy/Athletic/BroadShoulder) để tính chính xác khoảng tham chiếu `chestCm`, `waistCm`, `hipsCm`, `shoulderWidthCm`.
   - Hàm `calculateBmiCategory(heightCm, weightKg)` hiển thị nhãn tham khảo nhẹ nhàng, tích cực (*Cân đối*, *Thanh mảnh*, *Đầy đặn* — tránh ngôn ngữ tiêu cực).
3. **`src/features/avatar/three/OrganicMannequinBuilder.ts`** (Three.js Pure Builder):
   - **Tạo thân người liền mạch (Lofted Torso Geometry)**:
     - Chia trục thân từ hông đến cổ thành ~24 lát cắt theo chiều cao.
     - Tại mỗi lát cắt $y$, tính bán kính $R_x(y)$ (chiều ngang) và $R_z(y)$ (chiều sâu trước-sau) dựa trên nội suy trơn (Cubic Hermite / Cosine interpolation) qua 4 mốc số đo thực tế: `hips_cm` $\rightarrow$ `waist_cm` $\rightarrow$ `chest_cm` $\rightarrow$ `shoulder_width_cm`.
     - Tính cả độ cong tự nhiên của cột sống (lõm lưng nhẹ, nở ngực tự nhiên theo `genderStyle`) để dáng người nhìn mềm mại, có chiều sâu.
   - **Tạo các bộ phận hài hòa**:
     - Đầu & Cổ (tỷ lệ hài hòa với `heightCm`), kiểu tóc Stylized đơn giản (`HairMesh`) theo `hairStyle`.
     - Hai cánh tay buông nhẹ tự nhiên tạo góc ~12° so với thân (A-Pose nhẹ giúp dễ hình dung form áo).
     - Hai chân tỷ lệ theo `heightCm` và độ đầy đặn của đùi suy từ `hips_cm` & `weight_kg`.
     - Vật liệu PBR (`MeshStandardMaterial` với `roughness: 0.65`, `metalness: 0.04`) theo tông `skinTone` để ánh sáng studio phản chiếu dịu mắt như da sứ hoặc vải mannequin.
   - **Vòng thước đo 3D tương tác (`MeasureRingHelper`)**:
     - Các vòng Torus mảnh phát sáng (`#A25B26`) đặt đúng cao độ của Vai, Ngực, Eo, Hông.
     - Khi người dùng hover/chỉnh trường nào (`activeMetric: "chest" | "waist" | "hips" | "shoulder" | null`), vòng tương ứng sáng nổi bật, các vòng khác ẩn đi.
   - **Hàm `updateProportions(params)` & `dispose()`**:
     - Cho phép cập nhật lại Vertex Positions tại chỗ (`geometry.attributes.position.needsUpdate = true` + `computeVertexNormals()`) ở tốc độ **60 FPS** mà không cần tạo lại Scene hay Mesh mới!
     - Quản lý bộ nhớ chuẩn mực: gọi `.dispose()` cho tất cả geometry/material/renderer khi unmount.
4. **`src/features/avatar/components/Avatar3DCanvas.tsx`** (`"use client"`):
   - Khởi tạo WebGLRenderer (`antialias: true`, `pixelRatio: Math.min(dpr, 2)`, tone mapping `ACESFilmicToneMapping`).
   - Hệ thống **3-Point Studio Lighting** (Key light ấm + Fill light dịu + Rim light tách nền) + bệ đứng tròn tối giản (`Atelier Pedestal`) + vạch chia thước chiều cao phía sau.
   - `OrbitControls` (enableDamping, giới hạn góc nghiêng dọc để không nhìn xuyên sàn, hỗ trợ zoom vừa phải).
   - Nút điều khiển nổi góc viewport: Góc nhìn (`Toàn thân` / `Thân trên` / `Nghiêng` / `Mặt sau`), bật/tắt tự xoay chậm, bật/tắt vòng thước đo.
   - Idle breathing animation cực nhẹ (lồng ngực nở ±0.4% theo chu kỳ 4 giây) khiến avatar sống động tự nhiên.
5. **`src/features/avatar/components/BodyProfileBuilder.tsx`** (`"use client"`):
   - Cột trái của Workspace, thiết kế dạng Wizard 2 bước hoặc 3 Tabs gọn gàng:
     - **Tab 1: Khởi tạo nhanh**: Chọn Dáng người, Giới tính, Chiều cao, Cân nặng + nút *"Tự động tính số đo gợi ý"*.
     - **Tab 2: Tinh chỉnh Centimet**: Sliders + Ô nhập số chính xác cho Vai, Ngực, Eo, Hông (khi focus/hover vào slider nào, `activeMetric` truyền sang 3D Canvas để làm sáng vòng thước đo tương ứng!).
     - **Tab 3: Ngoại hình Avatar**: Chọn tên hồ sơ, Tông da/Chất liệu (5 swatches), Kiểu tóc (4 lựa chọn).
   - Thanh chuyển đổi nhanh giữa các Body Profiles đã lưu + nút **Lưu hồ sơ Avatar** (`POST` / `PUT /api/v1/body-profiles`) + nút **Đi tới Phòng thử đồ 3D** (`/try-on`).
6. **`src/features/avatar/hooks/useBodyProfiles.ts`** & **`services/bodyProfileService.ts`**:
   - Tải danh sách hồ sơ của user đang đăng nhập, xử lý trạng thái loading/saving/error, đồng bộ profile mặc định.
7. **`src/app/avatar/page.tsx`**:
   - Route `/avatar` cho phép người dùng đã đăng nhập tạo và quản lý Avatar 3D của mình (nếu chưa đăng nhập, hiển thị lời mời mở `AuthModal` hoặc vẫn cho dùng thử tính năng dựng Avatar trên trình duyệt và nhắc đăng nhập để lưu vào tài khoản!).
   - *Điểm cộng UX*: Cho phép **khách vãng lai cũng kéo thử được Avatar 3D**, nhưng khi nhấn **"Lưu Avatar cá nhân"** sẽ bật `AuthModal` mượt mà và tự động lưu ngay sau khi đăng nhập thành công!

---

## 5. LỘ TRÌNH THỰC HIỆN CHI TIẾT (4 STEPS)

1. **Bước 1 – Cài đặt công cụ & thư viện**:
   - Cài GitHub skills (`CloudAI-X/threejs-skills`, `emalorenzo/three-agent-skills`) nếu bạn muốn agent nạp thêm tri thức Three.js.
   - Cài `three` và `@types/three` cho `midora-frontend`.
2. **Bước 2 – Triển khai Backend `bodyprofile`**:
   - Tạo `BodyProfile` entity, `AvatarCustomizationParams`, `BodyProfileRepository`, `BodyProfileMapper`, `BodyProfileService`, `BodyProfileController`.
   - Bổ sung ErrorCodes (`BODY_PROFILE_NOT_FOUND`, `FORBIDDEN`) và viết Unit Tests (`BodyProfileServiceImplTest`).
   - Chạy `./mvnw test -Dtest="*Test"` xác minh biên dịch và logic.
3. **Bước 3 – Triển khai Frontend Three.js Organic Avatar Engine**:
   - Viết `bodyEstimator.ts` + `OrganicMannequinBuilder.ts` + `Avatar3DCanvas.tsx`.
   - Kiểm tra độ mượt khi kéo thanh trượt 60fps, vòng đo highlight 3D và quản lý bộ nhớ `.dispose()`.
4. **Bước 4 – Hoàn thiện Workspace `/avatar` & Tích hợp Navigation**:
   - Viết `BodyProfileBuilder.tsx`, `useBodyProfiles.ts`, `src/app/avatar/page.tsx`.
   - Gắn link "Avatar 3D" vào `Navbar.tsx` và `Hero.tsx`.
   - Chạy `npm run lint` và `npx tsc --noEmit` đảm bảo 0 lỗi.

