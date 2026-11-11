package com.midora.bodyprofile.mapper;

import com.midora.bodyprofile.dto.AvatarCustomizationParams;
import com.midora.bodyprofile.dto.response.BodyProfileResponse;
import com.midora.bodyprofile.entity.BodyProfile;
import org.springframework.stereotype.Component;

@Component
public class BodyProfileMapper {

    public BodyProfileResponse toResponse(BodyProfile entity) {
        if (entity == null) {
            return null;
        }
        AvatarCustomizationParams params = entity.getAvatarCustomizationParams() != null
                ? entity.getAvatarCustomizationParams().withDefaultsIfMissing()
                : AvatarCustomizationParams.defaults();

        return new BodyProfileResponse(
                entity.getId(),
                entity.getUser().getId(),
                entity.getProfileName(),
                entity.getHeightCm(),
                entity.getWeightKg(),
                entity.getChestCm(),
                entity.getWaistCm(),
                entity.getHipsCm(),
                entity.getShoulderWidthCm(),
                params,
                Boolean.TRUE.equals(entity.getIsDefault()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}

