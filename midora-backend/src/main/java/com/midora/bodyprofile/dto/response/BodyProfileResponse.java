package com.midora.bodyprofile.dto.response;

import com.midora.bodyprofile.dto.AvatarCustomizationParams;

import java.time.Instant;

public record BodyProfileResponse(
        Long id,
        Long userId,
        String profileName,
        Float heightCm,
        Float weightKg,
        Float chestCm,
        Float waistCm,
        Float hipsCm,
        Float shoulderWidthCm,
        AvatarCustomizationParams avatarCustomizationParams,
        Boolean isDefault,
        Instant createdAt,
        Instant updatedAt
) {
}

