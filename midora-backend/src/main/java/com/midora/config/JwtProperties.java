package com.midora.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "midora.jwt")
public record JwtProperties(
        String secret,
        long expirationMs
) {
}

