package com.midora.user.dto.response;

import com.midora.user.enums.UserRole;

import java.time.Instant;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        String phone,
        UserRole role,
        Instant createdAt
) {
}

