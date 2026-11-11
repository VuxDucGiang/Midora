package com.midora.bodyprofile.dto;

import jakarta.validation.constraints.Pattern;

public record AvatarCustomizationParams(
        @Pattern(regexp = "^(female|male|neutral)$", message = "Kiểu khung dáng phải là female, male hoặc neutral")
        String genderStyle,

        @Pattern(regexp = "^(slim|balanced|curvy|athletic|broad_shoulder)$", message = "Phom dáng cơ thể không hợp lệ")
        String bodyShape,

        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Mã màu tông da phải có định dạng #RRGGBB")
        String skinTone,

        @Pattern(regexp = "^(none|short_clean|medium_bob|long_straight)$", message = "Kiểu tóc không hợp lệ")
        String hairStyle
) {
    public static AvatarCustomizationParams defaults() {
        return new AvatarCustomizationParams("female", "balanced", "#DFB99B", "short_clean");
    }

    public AvatarCustomizationParams withDefaultsIfMissing() {
        AvatarCustomizationParams fallback = defaults();
        return new AvatarCustomizationParams(
                genderStyle != null ? genderStyle : fallback.genderStyle(),
                bodyShape != null ? bodyShape : fallback.bodyShape(),
                skinTone != null ? skinTone : fallback.skinTone(),
                hairStyle != null ? hairStyle : fallback.hairStyle()
        );
    }
}

