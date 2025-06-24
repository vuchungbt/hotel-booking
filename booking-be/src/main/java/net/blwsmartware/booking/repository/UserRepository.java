package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Role;
import net.blwsmartware.booking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Page<User> findByRole(Role role, Pageable pageable);
    
    Long countByCreateAtBetween(Instant startDate, Instant endDate);
}
