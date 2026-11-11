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
import com.midora.user.enums.UserRole;
import com.midora.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BodyProfileServiceImplTest {

    @Mock
    private BodyProfileRepository bodyProfileRepository;
    @Mock
    private UserRepository userRepository;

    private BodyProfileServiceImpl bodyProfileService;

    @BeforeEach
    void setUp() {
        bodyProfileService = new BodyProfileServiceImpl(
                bodyProfileRepository,
                userRepository,
                new BodyProfileMapper()
        );
    }

    @Test
    void createProfile_createsSingleProfileAndEstimatesShoulder() {
        User user = User.builder()
                .id(1L)
                .email("demo@midora.vn")
                .passwordHash("hash")
                .fullName("Minh Anh")
                .role(UserRole.ROLE_CUSTOMER)
                .build();

        BodyProfileRequest request = new BodyProfileRequest(
                null,
                165.0f,
                54.0f,
                86.0f,
                66.0f,
                92.0f,
                null,
                new AvatarCustomizationParams("female", "balanced", "#DFB99B", "medium_bob"),
                false
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bodyProfileRepository.findFirstByUserIdAndIsDefaultTrue(1L)).thenReturn(Optional.empty());
        when(bodyProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(1L)).thenReturn(Optional.empty());
        when(bodyProfileRepository.save(any(BodyProfile.class))).thenAnswer(inv -> {
            BodyProfile p = inv.getArgument(0);
            p.setId(100L);
            p.setCreatedAt(Instant.now());
            p.setUpdatedAt(Instant.now());
            return p;
        });

        BodyProfileResponse response = bodyProfileService.createProfile(1L, request);

        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.profileName()).isEqualTo("Số đo cá nhân");
        assertThat(response.isDefault()).isTrue();
        assertThat(response.shoulderWidthCm()).isBetween(34.0f, 44.0f);
        assertThat(response.avatarCustomizationParams().hairStyle()).isEqualTo("medium_bob");
    }

    @Test
    void createProfile_upsertsExistingProfileWhenAlreadyPresent() {
        User user = User.builder().id(1L).email("demo@midora.vn").fullName("An").passwordHash("x").build();
        BodyProfile existing = BodyProfile.builder()
                .id(20L)
                .user(user)
                .profileName("Số đo cá nhân")
                .heightCm(170f)
                .weightKg(65f)
                .chestCm(92f)
                .waistCm(76f)
                .hipsCm(94f)
                .shoulderWidthCm(43f)
                .isDefault(true)
                .build();

        BodyProfileRequest request = new BodyProfileRequest(
                "Số đo cá nhân",
                172.0f,
                66.0f,
                94.0f,
                74.0f,
                95.0f,
                44.0f,
                AvatarCustomizationParams.defaults(),
                true
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bodyProfileRepository.findFirstByUserIdAndIsDefaultTrue(1L)).thenReturn(Optional.of(existing));
        when(bodyProfileRepository.save(any(BodyProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        BodyProfileResponse updated = bodyProfileService.createProfile(1L, request);

        assertThat(updated.id()).isEqualTo(20L);
        assertThat(updated.isDefault()).isTrue();
        assertThat(updated.heightCm()).isEqualTo(172.0f);
        assertThat(updated.waistCm()).isEqualTo(74.0f);
    }

    @Test
    void getDefaultProfile_throwsNotFoundWhenEmpty() {
        when(bodyProfileRepository.findFirstByUserIdAndIsDefaultTrue(99L)).thenReturn(Optional.empty());
        when(bodyProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bodyProfileService.getDefaultProfile(99L))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getErrorCode())
                .isEqualTo(ErrorCode.BODY_PROFILE_NOT_FOUND);
    }
}
