package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.RoleOfUpdate;
import net.blwsmartware.booking.dto.request.UserRequest;
import net.blwsmartware.booking.dto.request.UserUpdate;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.UserResponse;

import java.util.UUID;

public interface UserService {
    UserResponse createUser(UserRequest request);
    DataResponse<UserResponse> getAll(Integer pageNumber, Integer pageSize, String sortBy);
    UserResponse getUserByID(UUID id);
    UserResponse getUserByEmail(String email);
    UserResponse getUserByUsername(String username);
    UserResponse updateUser(UUID id, UserUpdate request);
    UserResponse updateRoleOfUser(UUID id, RoleOfUpdate request);
    void deleteUser(UUID id);

}
