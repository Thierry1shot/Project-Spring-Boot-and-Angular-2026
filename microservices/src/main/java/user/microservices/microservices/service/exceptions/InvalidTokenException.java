package user.microservices.microservices.service.exceptions;

import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class InvalidTokenException extends RuntimeException {
    private String message;

    public InvalidTokenException(String message) {
        super(message);
    }
}
