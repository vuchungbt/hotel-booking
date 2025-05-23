package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.entity.Role;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    UUID id;
    String name;
    String username;
    String email;
    boolean isActive;
    Instant createAt;
    Instant updateAt;
    Set<Role> roles;
}
