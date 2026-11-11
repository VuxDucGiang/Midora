package com.midora.bodyprofile.repository;

import com.midora.bodyprofile.entity.BodyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BodyProfileRepository extends JpaRepository<BodyProfile, Long> {

    List<BodyProfile> findByUserIdOrderByIsDefaultDescUpdatedAtDesc(Long userId);

    Optional<BodyProfile> findByIdAndUserId(Long id, Long userId);

    Optional<BodyProfile> findFirstByUserIdAndIsDefaultTrue(Long userId);

    Optional<BodyProfile> findFirstByUserIdOrderByUpdatedAtDesc(Long userId);

    long countByUserId(Long userId);

    @Modifying
    @Query("UPDATE BodyProfile b SET b.isDefault = false WHERE b.user.id = :userId AND (:excludeId IS NULL OR b.id <> :excludeId)")
    void clearDefaultForUser(@Param("userId") Long userId, @Param("excludeId") Long excludeId);
}

