package com.midora.security;

import com.midora.config.JwtProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
public class JwtTokenProvider {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    private static final TypeReference<Map<String, Object>> MAP_TYPE_REF = new TypeReference<>() {};

    private final JwtProperties jwtProperties;
    private final ObjectMapper objectMapper;
    private final SecretKeySpec signingKey;

    public JwtTokenProvider(JwtProperties jwtProperties, ObjectMapper objectMapper) {
        this.jwtProperties = jwtProperties;
        this.objectMapper = objectMapper;
        this.signingKey = deriveSigningKey(jwtProperties.secret());
    }

    public String generateToken(MidoraUserPrincipal principal) {
        Instant now = Instant.now();
        long issuedAtSec = now.getEpochSecond();
        long expiresAtSec = now.plusMillis(jwtProperties.expirationMs()).getEpochSecond();

        Map<String, Object> header = Map.of(
                "alg", "HS256",
                "typ", "JWT"
        );

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", principal.getEmail());
        payload.put("uid", principal.getId());
        payload.put("role", principal.getRole().name());
        payload.put("iat", issuedAtSec);
        payload.put("exp", expiresAtSec);

        String encodedHeader = encodeJson(header);
        String encodedPayload = encodeJson(payload);
        String signingInput = encodedHeader + "." + encodedPayload;
        String encodedSignature = BASE64_URL_ENCODER.encodeToString(sign(signingInput));

        return signingInput + "." + encodedSignature;
    }

    public Optional<JwtClaims> parseAndValidate(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return Optional.empty();
        }

        try {
            String signingInput = parts[0] + "." + parts[1];
            byte[] expectedSig = sign(signingInput);
            byte[] actualSig = BASE64_URL_DECODER.decode(parts[2]);
            if (!MessageDigest.isEqual(expectedSig, actualSig)) {
                return Optional.empty();
            }

            Map<String, Object> header = decodeJson(parts[0]);
            if (!"HS256".equals(header.get("alg"))) {
                return Optional.empty();
            }

            Map<String, Object> payload = decodeJson(parts[1]);
            Object expObj = payload.get("exp");
            if (!(expObj instanceof Number expNum)) {
                return Optional.empty();
            }
            long expiresAtSec = expNum.longValue();
            if (Instant.now().getEpochSecond() >= expiresAtSec) {
                return Optional.empty();
            }

            String email = payload.get("sub") instanceof String s ? s : null;
            Long userId = payload.get("uid") instanceof Number n ? n.longValue() : null;
            String role = payload.get("role") instanceof String r ? r : null;
            if (email == null || userId == null || role == null) {
                return Optional.empty();
            }

            return Optional.of(new JwtClaims(userId, email, role));
        } catch (Exception ex) {
            log.debug("Invalid JWT token: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private String encodeJson(Map<String, Object> map) {
        String json = objectMapper.writeValueAsString(map);
        return BASE64_URL_ENCODER.encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    private Map<String, Object> decodeJson(String encoded) {
        byte[] bytes = BASE64_URL_DECODER.decode(encoded);
        return objectMapper.readValue(bytes, MAP_TYPE_REF);
    }

    private byte[] sign(String signingInput) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(signingKey);
            return mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Failed to compute HMAC-SHA256 signature", ex);
        }
    }

    private static SecretKeySpec deriveSigningKey(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("midora.jwt.secret must not be blank");
        }
        byte[] keyBytes;
        if (secret.length() >= 64 && secret.length() % 2 == 0 && secret.matches("^[0-9a-fA-F]+$")) {
            keyBytes = HexFormat.of().parseHex(secret);
        } else {
            byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
            if (raw.length < 32) {
                try {
                    keyBytes = MessageDigest.getInstance("SHA-256").digest(raw);
                } catch (GeneralSecurityException ex) {
                    throw new IllegalStateException("Failed to derive JWT key", ex);
                }
            } else {
                keyBytes = raw;
            }
        }
        return new SecretKeySpec(keyBytes, HMAC_ALGORITHM);
    }

    public record JwtClaims(Long userId, String email, String role) {
    }
}

