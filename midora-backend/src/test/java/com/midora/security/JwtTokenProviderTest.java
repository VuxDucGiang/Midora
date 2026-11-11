package com.midora.security;

import com.midora.config.JwtProperties;
import com.midora.user.entity.User;
import com.midora.user.enums.UserRole;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String TEST_SECRET =
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void generateAndValidateToken_returnsExpectedClaims() {
        JwtTokenProvider provider = new JwtTokenProvider(
                new JwtProperties(TEST_SECRET, 3_600_000L),
                objectMapper
        );
        User user = User.builder()
                .id(42L)
                .email("vintage@midora.vn")
                .passwordHash("hashed")
                .fullName("Vintage Lover")
                .role(UserRole.ROLE_CUSTOMER)
                .build();

        String token = provider.generateToken(new MidoraUserPrincipal(user));
        Optional<JwtTokenProvider.JwtClaims> claims = provider.parseAndValidate(token);

        assertThat(claims).isPresent();
        assertThat(claims.get().userId()).isEqualTo(42L);
        assertThat(claims.get().email()).isEqualTo("vintage@midora.vn");
        assertThat(claims.get().role()).isEqualTo("ROLE_CUSTOMER");
    }

    @Test
    void parseAndValidate_rejectsTamperedToken() {
        JwtTokenProvider provider = new JwtTokenProvider(
                new JwtProperties(TEST_SECRET, 3_600_000L),
                objectMapper
        );
        User user = User.builder()
                .id(1L)
                .email("user@midora.vn")
                .passwordHash("hashed")
                .fullName("User")
                .role(UserRole.ROLE_CUSTOMER)
                .build();

        String token = provider.generateToken(new MidoraUserPrincipal(user));
        String tampered = token.substring(0, token.length() - 2) + "xx";

        assertThat(provider.parseAndValidate(tampered)).isEmpty();
    }

    @Test
    void parseAndValidate_rejectsExpiredToken() {
        JwtTokenProvider provider = new JwtTokenProvider(
                new JwtProperties(TEST_SECRET, -10_000L),
                objectMapper
        );
        User user = User.builder()
                .id(1L)
                .email("expired@midora.vn")
                .passwordHash("hashed")
                .fullName("Expired User")
                .role(UserRole.ROLE_CUSTOMER)
                .build();

        String token = provider.generateToken(new MidoraUserPrincipal(user));

        assertThat(provider.parseAndValidate(token)).isEmpty();
    }
}

