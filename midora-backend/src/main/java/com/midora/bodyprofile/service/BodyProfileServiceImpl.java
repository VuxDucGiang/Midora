package com.midora.bodyprofile.service;

import com.midora.bodyprofile.dto.AvatarCustomizationParams;
import com.midora.bodyprofile.dto.request.BodyProfileRequest;
import com.midora.bodyprofile.dto.response.BodyProfileResponse;
import com.midora.bodyprofile.entity.BodyProfile;
import com.midora.bodyprofile.mapper.BodyProfileMapper;
import com.midora.bodyprofile.repository.BodyProfileRepository;
import com.midora.common.exception.BusinessException;
import com.midora.common.exception.ErrorCode;
import com.midora.user.entity.User;
import com.midora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BodyProfileServiceImpl implements BodyProfileService {

    private final BodyProfileRepository bodyProfileRepository;
    private final UserRepository userRepository;
    private final BodyProfileMapper bodyProfileMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BodyProfileResponse> getMyProfiles(Long userId) {
        return bodyProfileRepository.findByUserIdOrderByIsDefaultDescUpdatedAtDesc(userId)
                .stream()
                .map(bodyProfileMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BodyProfileResponse getDefaultProfile(Long userId) {
        BodyProfile profile = bodyProfileRepository.findFirstByUserIdAndIsDefaultTrue(userId)
                .or(() -> bodyProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId))
                .orElseThrow(() -> new BusinessException(ErrorCode.BODY_PROFILE_NOT_FOUND));
        return bodyProfileMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public BodyProfileResponse createProfile(Long userId, BodyProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        AvatarCustomizationParams customization = request.avatarCustomizationParams() != null
                ? request.avatarCustomizationParams().withDefaultsIfMissing()
                : AvatarCustomizationParams.defaults();

        float shoulderWidth = resolveShoulderWidth(request, customization);
        String resolvedName = resolveProfileName(request.profileName());

        // Single-profile-per-user invariant: update existing profile in-place if present
        BodyProfile profile = bodyProfileRepository.findFirstByUserIdAndIsDefaultTrue(userId)
                .or(() -> bodyProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId))
                .orElseGet(() -> BodyProfile.builder().user(user).build());

        profile.setProfileName(resolvedName);
        profile.setHeightCm(request.heightCm());
        profile.setWeightKg(request.weightKg());
        profile.setChestCm(request.chestCm());
        profile.setWaistCm(request.waistCm());
        profile.setHipsCm(request.hipsCm());
        profile.setShoulderWidthCm(shoulderWidth);
        profile.setAvatarCustomizationParams(customization);
        profile.setIsDefault(true);

        BodyProfile saved = bodyProfileRepository.save(profile);
        return bodyProfileMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BodyProfileResponse updateProfile(Long userId, Long profileId, BodyProfileRequest request) {
        BodyProfile profile = bodyProfileRepository.findByIdAndUserId(profileId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BODY_PROFILE_NOT_FOUND));

        AvatarCustomizationParams customization = request.avatarCustomizationParams() != null
                ? request.avatarCustomizationParams().withDefaultsIfMissing()
                : (profile.getAvatarCustomizationParams() != null
                    ? profile.getAvatarCustomizationParams().withDefaultsIfMissing()
                    : AvatarCustomizationParams.defaults());

        profile.setIsDefault(true);
        profile.setProfileName(resolveProfileName(request.profileName()));
        profile.setHeightCm(request.heightCm());
        profile.setWeightKg(request.weightKg());
        profile.setChestCm(request.chestCm());
        profile.setWaistCm(request.waistCm());
        profile.setHipsCm(request.hipsCm());
        profile.setShoulderWidthCm(resolveShoulderWidth(request, customization));
        profile.setAvatarCustomizationParams(customization);

        BodyProfile saved = bodyProfileRepository.save(profile);
        return bodyProfileMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BodyProfileResponse setDefaultProfile(Long userId, Long profileId) {
        BodyProfile profile = bodyProfileRepository.findByIdAndUserId(profileId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BODY_PROFILE_NOT_FOUND));

        bodyProfileRepository.clearDefaultForUser(userId, profileId);
        profile.setIsDefault(true);
        BodyProfile saved = bodyProfileRepository.save(profile);
        return bodyProfileMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProfile(Long userId, Long profileId) {
        BodyProfile profile = bodyProfileRepository.findByIdAndUserId(profileId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BODY_PROFILE_NOT_FOUND));

        boolean wasDefault = Boolean.TRUE.equals(profile.getIsDefault());
        bodyProfileRepository.delete(profile);
        bodyProfileRepository.flush();

        if (wasDefault) {
            bodyProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId)
                    .ifPresent(next -> {
                        next.setIsDefault(true);
                        bodyProfileRepository.save(next);
                    });
        }
    }

    private float resolveShoulderWidth(BodyProfileRequest request, AvatarCustomizationParams customization) {
        if (request.shoulderWidthCm() != null) {
            return request.shoulderWidthCm();
        }
        float ratio = "male".equals(customization.genderStyle()) ? 0.255f : 0.235f;
        float estimated = request.heightCm() * ratio + (request.chestCm() - 88.0f) * 0.14f;
        return Math.round(Math.max(32.0f, Math.min(58.0f, estimated)) * 10.0f) / 10.0f;
    }

    private String resolveProfileName(String rawName) {
        if (rawName == null || rawName.isBlank()) {
            return "Số đo cá nhân";
        }
        return rawName.trim();
    }
}

