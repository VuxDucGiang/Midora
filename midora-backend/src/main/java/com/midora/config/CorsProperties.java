package com.midora.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "midora.cors")
public record CorsProperties(
        List<String> allowedOrigins
) {
}

