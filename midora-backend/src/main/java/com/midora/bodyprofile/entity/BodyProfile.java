package com.midora.bodyprofile.entity;

import com.midora.bodyprofile.dto.AvatarCustomizationParams;
import com.midora.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "body_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @Column(name = "profile_name", length = 100)
    private String profileName = "Default Profile";

    @Column(name = "height_cm", nullable = false)
    private Float heightCm;

    @Column(name = "weight_kg", nullable = false)
    private Float weightKg;

    @Column(name = "chest_cm", nullable = false)
    private Float chestCm;

    @Column(name = "waist_cm", nullable = false)
    private Float waistCm;

    @Column(name = "hips_cm", nullable = false)
    private Float hipsCm;

    @Column(name = "shoulder_width_cm")
    private Float shoulderWidthCm;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "avatar_customization_params", columnDefinition = "json")
    private AvatarCustomizationParams avatarCustomizationParams;

    @Builder.Default
    @Column(name = "is_default")
    private Boolean isDefault = true;

    @CreationTimestamp
    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "updated_at")
    private Instant updatedAt;
}

