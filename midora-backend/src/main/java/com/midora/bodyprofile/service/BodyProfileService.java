package com.midora.bodyprofile.service;

import com.midora.bodyprofile.dto.request.BodyProfileRequest;
import com.midora.bodyprofile.dto.response.BodyProfileResponse;

import java.util.List;

public interface BodyProfileService {

    List<BodyProfileResponse> getMyProfiles(Long userId);

    BodyProfileResponse getDefaultProfile(Long userId);

    BodyProfileResponse createProfile(Long userId, BodyProfileRequest request);

    BodyProfileResponse updateProfile(Long userId, Long profileId, BodyProfileRequest request);

    BodyProfileResponse setDefaultProfile(Long userId, Long profileId);

    void deleteProfile(Long userId, Long profileId);
}

