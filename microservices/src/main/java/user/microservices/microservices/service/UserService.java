package user.microservices.microservices.service;

import java.util.List;

import user.microservices.microservices.entities.*;
import user.microservices.microservices.service.register.RegistrationRequest;

public interface UserService {
    User saveUser(User user);

    User findUserByUsername(String username);

    Role addRole(Role role);

    User addRoleToUser(String username, String rolename);

    List<User> findAllUsers();

    User registerUser(RegistrationRequest request);

    void sendEmailUser(User u, String code);
}
