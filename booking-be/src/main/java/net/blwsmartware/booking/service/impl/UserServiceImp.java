package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.constant.PredefinedRole;
import net.blwsmartware.booking.dto.request.*;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.UserResponse;
import net.blwsmartware.booking.entity.Role;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.exception.IdentityRuntimeException;
import net.blwsmartware.booking.mapper.UserMapper;
import net.blwsmartware.booking.repository.RoleRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.EmailService;
import net.blwsmartware.booking.service.UserService;
import net.blwsmartware.booking.util.DataResponseUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImp implements UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    EmailService emailService;

    public static String generateRandomString(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder result = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characters.length());
            result.append(characters.charAt(index));
        }

        return result.toString();
    }

    @Override
    public UserResponse createUser(UserRequest request) {

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Role roleUserDefault = roleRepository.findByName(PredefinedRole.USER_ROLE)
                .orElseThrow(() -> new IdentityRuntimeException(ErrorResponse.ROLE_NOT_EXISTED) );

        Set<Role> roleSet = Set.of(roleUserDefault);
        user.setRoles(roleSet);

        user = userRepository.save(user);

        if(user.getId()!=null ) {
            String code = generateRandomString(6);
            emailService.sendEmail(
                    EmailRequest.builder()
                            .to(user.getEmail())
                            .content("Your verification code:"+code)
                            .subject("Verification Code")
                            .build());
        }

        return userMapper.toUserResponse(user);
    }

    @Override
    public DataResponse<UserResponse> getAll(Integer pageNumber, Integer pageSize, String sortBy) {

        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).ascending());
        Page<User> pageOfUsers = userRepository.findAll(pageable);
        List<User> userList = pageOfUsers.getContent();
        List<UserResponse>  userResponses = userList.stream().map(userMapper::toUserResponse).toList();
        return DataResponseUtils.convertPageInfo(pageOfUsers,userResponses);
    }

    @Override
    public UserResponse getUserByID(UUID id) {
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new IdentityRuntimeException(ErrorResponse.USER_NOT_FOUND))
        );
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        return userMapper.toUserResponse(userRepository.findByEmail(email)
                .orElseThrow(() -> new IdentityRuntimeException(ErrorResponse.USER_NOT_FOUND))
        );
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        return userMapper.toUserResponse(userRepository.findByUsername(username)
                .orElseThrow(() -> new IdentityRuntimeException(ErrorResponse.USER_NOT_FOUND))
        );
    }

    @Override
    public UserResponse updateUser(UUID id, UserUpdate request) {
        User old = userRepository.findById(id)
                .orElseThrow(() -> new IdentityRuntimeException(ErrorResponse.USER_NOT_FOUND));

        userMapper.updateUser(request,old);

        old.setPassword(passwordEncoder.encode(request.getPassword()));
        return userMapper.toUserResponse(userRepository.save(old));
    }

    @Override
    public UserResponse updateRoleOfUser(UUID id, RoleOfUpdate request) {
        User old = userRepository.findById(id)
                .orElseThrow(() -> new IdentityRuntimeException(ErrorResponse.USER_NOT_FOUND));
        var roles = roleRepository.findAllById(request.getRoleIds());
        old.setRoles(new HashSet<>(roles));
        return userMapper.toUserResponse(userRepository.save(old));
    }

    @Override
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }
}
