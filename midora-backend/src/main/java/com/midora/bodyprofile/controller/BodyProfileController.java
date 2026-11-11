package com.midora.bodyprofile.controller;

import com.midora.bodyprofile.dto.request.BodyProfileRequest;
import com.midora.bodyprofile.dto.response.BodyProfileResponse;
import com.midora.bodyprofile.service.BodyProfileService;
import com.midora.common.dto.ApiResponse;
import com.midora.security.MidoraUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/body-profiles")
@RequiredArgsConstructor
public class BodyProfileController {

    private final BodyProfileService bodyProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BodyProfileResponse>>> getMyProfiles(
            @AuthenticationPrincipal MidoraUserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(bodyProfileService.getMyProfiles(principal.getId())));
    }

    @GetMapping("/default")
    public ResponseEntity<ApiResponse<BodyProfileResponse>> getDefaultProfile(
            @AuthenticationPrincipal MidoraUserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(bodyProfileService.getDefaultProfile(principal.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BodyProfileResponse>> createProfile(
            @AuthenticationPrincipal MidoraUserPrincipal principal,
            @Valid @RequestBody BodyProfileRequest request
    ) {
        BodyProfileResponse created = bodyProfileService.createProfile(principal.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo hồ sơ số đo 3D thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BodyProfileResponse>> updateProfile(
            @AuthenticationPrincipal MidoraUserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody BodyProfileRequest request
    ) {
        BodyProfileResponse updated = bodyProfileService.updateProfile(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật hồ sơ số đo 3D thành công", updated));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<BodyProfileResponse>> setDefaultProfile(
            @AuthenticationPrincipal MidoraUserPrincipal principal,
            @PathVariable Long id
    ) {
        BodyProfileResponse updated = bodyProfileService.setDefaultProfile(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Đã đặt làm hồ sơ Avatar mặc định", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @AuthenticationPrincipal MidoraUserPrincipal principal,
            @PathVariable Long id
    ) {
        bodyProfileService.deleteProfile(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa hồ sơ số đo", null));
    }
}

