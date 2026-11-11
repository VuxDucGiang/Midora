package com.midora.auth.service;

import com.midora.auth.dto.request.LoginRequest;
import com.midora.auth.dto.request.RegisterRequest;
import com.midora.auth.dto.response.AuthResponse;
import com.midora.user.dto.response.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(Long userId);
}

