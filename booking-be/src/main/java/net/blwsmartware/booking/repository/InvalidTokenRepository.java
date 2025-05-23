package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.InvalidToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InvalidTokenRepository extends JpaRepository<InvalidToken, UUID> {
}
