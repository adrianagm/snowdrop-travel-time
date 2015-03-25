package com.snowdropsolutions.dm.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Base class for RestControllers.
 *
 * Its use as base class is required for the automatic handling of <c>RestException</c>
 * to ease the return of HTTP error codes.
 *
 * @author lroman
 */
@RestController
public abstract class BaseRestWebService {

    @ExceptionHandler(RestException.class)
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    protected ResponseEntity<String> handleException(RestException ex) {
        return new ResponseEntity<>(ex.getMessage(), ex.getStatus());
    }   

}
