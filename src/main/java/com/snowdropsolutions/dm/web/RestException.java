package com.snowdropsolutions.dm.web;

import org.springframework.http.HttpStatus;

/**
 * Exception used to return with an specific (e.g. non 200) HTTP code from a <c>BaseRestWebService</c> service.
 *
 * @author lroman
 */
public class RestException extends RuntimeException {

    private final HttpStatus status;

    /**
     * Builds a new RestException instance.
     *
     * @param status The HttpStatus enumeration value corresponding to the code that the response should have.
     * @param message The message or code to be sent to the client.
     * @param innerException The exception causing this one to be thrown, if any.
     */
    public RestException(HttpStatus status, String message, Throwable innerException) {
        super(message, innerException);
        this.status = status;
    }

    /**
     * @return the status
     */
    public HttpStatus getStatus() {
        return status;
    }

}
