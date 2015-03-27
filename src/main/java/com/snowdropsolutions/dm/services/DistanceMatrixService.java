package com.snowdropsolutions.dm.services;

import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import com.google.common.base.Joiner;
import com.snowdropsolutions.dm.web.DistanceMatrixWebService;
import com.snowdropsolutions.dm.web.RestException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Implements a Google Maps services's backed DistanceMatrix web service.
 *
 * @author lroman
 */
@Service
public class DistanceMatrixService {

    @Autowired
    private UrlSigner urlSigner;

    private static final Logger LOG = Logger.getLogger(DistanceMatrixService.class.getName());

    private static final String DM_SERVICE_URL
            = "https://maps.googleapis.com/maps/api/distancematrix/json";

    private static int MAX_DESTINATIONS = 100;
    
    public String retrieveDM(String[] origins, String[] destinations, String mode, String avoid) throws UnsupportedEncodingException {
        String requestResource;
        String completeResponse = "";
        String formatedOrigins = formatArray(origins);

        for (int i = 0; i < Math.floor(destinations.length/ MAX_DESTINATIONS) + 1; i++) {
            String[] destinationPartial = Arrays.copyOfRange(destinations, i*MAX_DESTINATIONS, (i+1)*MAX_DESTINATIONS);
            String formatedDestinations = formatArray(destinationPartial);
            String queryString = "?sensor=false&origins=" + formatedOrigins + "&destinations=" + formatedDestinations;
            
            if (mode != null && !mode.equals("")) {
                queryString += "&mode=" + mode;
            }

             if (avoid != null && !avoid.equals("")) {
                queryString += "&avoid=" + avoid;
            }             
             
            URL url;
            URI uri;
            // An encoded url for the request is created.
            try {
                url = new URL(DM_SERVICE_URL + queryString);
                uri = new URI(url.getProtocol(), url.getHost(), url.getPath(), url.getQuery(), url.getRef());
                url = uri.toURL();
            } catch (URISyntaxException | MalformedURLException ex) {
                throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
            }

            // The request is signed, see UrlSigner class for more info in the process. 
            try {
                requestResource = urlSigner.signRequest(url.getPath(), url.getQuery());
            } catch (NoSuchAlgorithmException | InvalidKeyException | UnsupportedEncodingException | URISyntaxException ex) {

                Logger.getLogger(DistanceMatrixWebService.class.getName()).log(Level.SEVERE, null, ex);
                throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
            }

            // We perform the remote request.
            HTTPResponse response;
            
            URLFetchService urlFetchService = URLFetchServiceFactory.getURLFetchService();
            String requestURL = url.getProtocol() + "://" + url.getHost() + requestResource;
            
            
            try {
                response = urlFetchService.fetch(new HTTPRequest(new URL(requestURL)));
                String responseString = new String(response.getContent(), "UTF-8");
                completeResponse += responseString + ",";
            } catch (IOException ex) {
                Logger.getLogger(DistanceMatrixWebService.class.getName()).log(Level.SEVERE, null, ex);
                throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
            }

            HttpStatus responseStatus = HttpStatus.valueOf(response.getResponseCode());
            if (!responseStatus.is2xxSuccessful()) {
                throw new RestException(responseStatus, new String(response.getContent()), null);
            }
        }
        
        return completeResponse;
    }
    
    private String formatArray(String[] places) {
        return Joiner.on("|").skipNulls().join(places);
    }
}
