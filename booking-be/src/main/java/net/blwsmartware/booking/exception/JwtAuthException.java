package net.blwsmartware.booking.exception;

import org.springframework.security.core.AuthenticationException;

public class JwtAuthException extends AuthenticationException {
    public JwtAuthException(String msg, Throwable cause) {
        super(msg, cause);
    }
}