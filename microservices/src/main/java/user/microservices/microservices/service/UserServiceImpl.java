package user.microservices.microservices.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import user.microservices.microservices.entities.Role;
import user.microservices.microservices.entities.User;
import user.microservices.microservices.repos.RoleRepository;
import user.microservices.microservices.repos.UserRepository;
import user.microservices.microservices.service.exceptions.EmailAlreadyExistsException;
import user.microservices.microservices.service.register.RegistrationRequest;
import user.microservices.microservices.service.register.VerificationToken;
import user.microservices.microservices.service.register.VerificationTokenRepository;
import user.microservices.microservices.util.EmailSender;

@Transactional
@Service
public class UserServiceImpl implements UserService {
    final UserRepository userRep;
    final RoleRepository roleRep;
    final BCryptPasswordEncoder bCryptPasswordEncoder;
    final VerificationTokenRepository verificationTokenRepo;
    final EmailSender emailSender;

    UserServiceImpl(UserRepository userRep, RoleRepository roleRep, BCryptPasswordEncoder bCryptPasswordEncoder,
            VerificationTokenRepository verificationTokenRepo, EmailSender emailSender) {
        this.userRep = userRep;
        this.roleRep = roleRep;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.verificationTokenRepo = verificationTokenRepo;
        this.emailSender = emailSender;
    }

    @Override
    public User saveUser(User user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        return userRep.save(user);
    }

    @Override
    public User addRoleToUser(String username, String rolename) {
        User usr = userRep.findByUsername(username);
        Role r = roleRep.findByRole(rolename);
        usr.getRoles().add(r);
        return usr;
    }

    @Override
    public Role addRole(Role role) {
        return roleRep.save(role);
    }

    @Override
    public User findUserByUsername(String username) {
        return userRep.findByUsername(username);
    }

    @Override
    public List<User> findAllUsers() {
        return userRep.findAll();
    }

    @Override
    public User registerUser(RegistrationRequest request) {
        Optional<User> optionaluser = userRep.findByEmail(request.getEmail());
        if (optionaluser.isPresent())
            throw new EmailAlreadyExistsException("email déjà existant!");
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());

        newUser.setPassword(bCryptPasswordEncoder.encode(request.getPassword()));
        newUser.setEnabled(false);
        userRep.save(newUser);
        // ajouter à newUser le role par défaut USER
        Role r = roleRep.findByRole("USER");
        List<Role> roles = new ArrayList<>();
        roles.add(r);
        newUser.setRoles(roles);

        // génére le code secret
        String code = this.generateCode();

        VerificationToken token = new VerificationToken(code, newUser);
        verificationTokenRepo.save(token);

        // envoyer par email pour valider l'email de l'utilisateur
        sendEmailUser(newUser, token.getToken());

        return userRep.save(newUser);
    }

    public String generateCode() {
        Random random = new Random();
        Integer code = 100000 + random.nextInt(900000);

        return code.toString();
    }

    public void sendEmailUser(User u, String code) {
        String emailBody = "Bonjour " + "<h1>" + u.getUsername() + "</h1>" +
                " Votre code de validation est " + "<h1>" + code + "</h1>";
        emailSender.sendEmail(u.getEmail(), emailBody);
    }

}
