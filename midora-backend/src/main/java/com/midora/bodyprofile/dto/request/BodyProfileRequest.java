package com.midora.bodyprofile.dto.request;

import com.midora.bodyprofile.dto.AvatarCustomizationParams;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BodyProfileRequest(
        @NotBlank(message = "Tên hồ sơ số đo không được để trống")
        @Size(max = 100, message = "Tên hồ sơ tối đa 100 ký tự")
        String profileName,

        @NotNull(message = "Chiều cao không được để trống")
        @DecimalMin(value = "120.0", message = "Chiều cao tối thiểu 120 cm")
        @DecimalMax(value = "220.0", message = "Chiều cao tối đa 220 cm")
        Float heightCm,

        @NotNull(message = "Cân nặng không được để trống")
        @DecimalMin(value = "30.0", message = "Cân nặng tối thiểu 30 kg")
        @DecimalMax(value = "200.0", message = "Cân nặng tối đa 200 kg")
        Float weightKg,

        @NotNull(message = "Vòng ngực không được để trống")
        @DecimalMin(value = "60.0", message = "Vòng ngực tối thiểu 60 cm")
        @DecimalMax(value = "160.0", message = "Vòng ngực tối đa 160 cm")
        Float chestCm,

        @NotNull(message = "Vòng eo không được để trống")
        @DecimalMin(value = "45.0", message = "Vòng eo tối thiểu 45 cm")
        @DecimalMax(value = "150.0", message = "Vòng eo tối đa 150 cm")
        Float waistCm,

        @NotNull(message = "Vòng hông không được để trống")
        @DecimalMin(value = "65.0", message = "Vòng hông tối thiểu 65 cm")
        @DecimalMax(value = "170.0", message = "Vòng hông tối đa 170 cm")
        Float hipsCm,

        @DecimalMin(value = "30.0", message = "Chiều rộng vai tối thiểu 30 cm")
        @DecimalMax(value = "65.0", message = "Chiều rộng vai tối đa 65 cm")
        Float shoulderWidthCm,

        @Valid
        AvatarCustomizationParams avatarCustomizationParams,

        Boolean isDefault
) {
}

