package com.midora.auth.service;

import com.midora.auth.dto.request.LoginRequest;
import com.midora.auth.dto.request.RegisterRequest;
import com.midora.auth.dto.response.AuthResponse;
import com.midora.common.exception.BusinessException;
import com.midora.common.exception.ErrorCode;
import com.midora.config.JwtProperties;
import com.midora.security.JwtTokenProvider;
import com.midora.security.MidoraUserPrincipal;
import com.midora.user.dto.response.UserResponse;
import com.midora.user.entity.User;
import com.midora.user.enums.UserRole;
import com.midora.user.mapper.UserMapper;
import com.midora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        String normalizedPhone = request.phone() != null && !request.phone().isBlank()
                ? request.phone().trim()
                : null;

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .phone(normalizedPhone)
                .role(UserRole.ROLE_CUSTOMER)
                .build();

        User savedUser = userRepository.save(user);
        MidoraUserPrincipal principal = new MidoraUserPrincipal(savedUser);
        String token = jwtTokenProvider.generateToken(principal);

        return AuthResponse.bearer(token, jwtProperties.expirationMs(), userMapper.toResponse(savedUser));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
        );

        MidoraUserPrincipal principal = (MidoraUserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String token = jwtTokenProvider.generateToken(principal);
        return AuthResponse.bearer(token, jwtProperties.expirationMs(), userMapper.toResponse(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toResponse(user);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

