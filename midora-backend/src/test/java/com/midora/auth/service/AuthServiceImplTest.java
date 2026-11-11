package com.midora.auth.service;

import com.midora.auth.dto.request.LoginRequest;
import com.midora.auth.dto.request.RegisterRequest;
import com.midora.auth.dto.response.AuthResponse;
import com.midora.common.exception.BusinessException;
import com.midora.common.exception.ErrorCode;
import com.midora.config.JwtProperties;
import com.midora.security.JwtTokenProvider;
import com.midora.security.MidoraUserPrincipal;
import com.midora.user.entity.User;
import com.midora.user.enums.UserRole;
import com.midora.user.mapper.UserMapper;
import com.midora.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        JwtProperties jwtProperties = new JwtProperties(
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
                86_400_000L
        );
        JwtTokenProvider jwtTokenProvider = new JwtTokenProvider(jwtProperties, new ObjectMapper());
        authService = new AuthServiceImpl(
                userRepository,
                new UserMapper(),
                passwordEncoder,
                authenticationManager,
                jwtTokenProvider,
                jwtProperties
        );
    }

    @Test
    void register_createsCustomerAndReturnsJwt() {
        RegisterRequest request = new RegisterRequest(
                "  NewUser@Midora.vn ",
                "Secret123",
                "Nguyễn Văn An",
                "0901234567"
        );

        when(userRepository.existsByEmailIgnoreCase("newuser@midora.vn")).thenReturn(false);
        when(passwordEncoder.encode("Secret123")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            u.setCreatedAt(Instant.now());
            return u;
        });

        AuthResponse response = authService.register(request);

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.user().id()).isEqualTo(10L);
        assertThat(response.user().email()).isEqualTo("newuser@midora.vn");
        assertThat(response.user().role()).isEqualTo(UserRole.ROLE_CUSTOMER);
        verify(passwordEncoder).encode("Secret123");
    }

    @Test
    void register_throwsConflictWhenEmailExists() {
        RegisterRequest request = new RegisterRequest(
                "taken@midora.vn",
                "Secret123",
                "Taken User",
                null
        );
        when(userRepository.existsByEmailIgnoreCase("taken@midora.vn")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getErrorCode())
                .isEqualTo(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    @Test
    void login_returnsAuthResponseWhenCredentialsValid() {
        User user = User.builder()
                .id(5L)
                .email("buyer@midora.vn")
                .passwordHash("$2a$10$hash")
                .fullName("Buyer Midora")
                .role(UserRole.ROLE_CUSTOMER)
                .createdAt(Instant.now())
                .build();
        MidoraUserPrincipal principal = new MidoraUserPrincipal(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities()
        );

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(new LoginRequest("BUYER@midora.vn", "Secret123"));

        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.user().email()).isEqualTo("buyer@midora.vn");
        assertThat(response.user().fullName()).isEqualTo("Buyer Midora");
    }
}

