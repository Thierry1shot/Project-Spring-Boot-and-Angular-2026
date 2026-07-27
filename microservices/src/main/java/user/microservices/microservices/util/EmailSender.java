package user.microservices.microservices.util;

public interface EmailSender {
    void sendEmail(String toEmail, String body);
}
