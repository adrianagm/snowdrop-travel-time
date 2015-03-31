package com.snowdropsolutions.dm.services;

import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import com.google.appengine.repackaged.com.google.gson.Gson;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    private static final String DM_SERVICE_URL
            = "https://maps.googleapis.com/maps/api/distancematrix/json";

    private static final int MAX_DESTINATIONS = 100;

    /**
     * Performs requests (one or several, depending on the number of imputs) to Google's DistanceMatrix service and returns
     *
     * @param origins
     * @param destinations
     * @param mode
     * @param avoid
     * @return
     * @throws UnsupportedEncodingException
     */
    public String retrieveDM(String[] origins, String[] destinations, String mode, String avoid) throws UnsupportedEncodingException {
        String requestResource;
        String formatedOrigins = formatArray(origins);

        // In this object we will accumulate the results from the possible several requests that we might need to perform.
        // We will return the same structure as one simple request would have, but with (possibly) more results.
        Map<String, Object> result = new HashMap<>();

        Gson gson = new Gson(); // Object used to serialize and deserialize from/to JSON.

        // We calculate the amount of requests to be done using a supposed 3 decimal places for
        // origin and destinations' latitude and longitude attributes. You might want to enforce
        // that instead just supposing, or just check the URL length as it is created.
        for (int i = 0; i < Math.floor(destinations.length / MAX_DESTINATIONS) + 1; i++) {
            String[] destinationPartial = Arrays.copyOfRange(destinations, i * MAX_DESTINATIONS, (i + 1) * MAX_DESTINATIONS);
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
            // An encoded url for the request is created, using a very complicated Java-ism in order to
            // get it right.
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
                // Needed to properly a UTF-8 string from getContent's returned byte array.
                String responseString = new String(response.getContent(), "UTF-8");

                Map<String, Object> partialResult = gson.fromJson(responseString, result.getClass());
                if (result.isEmpty()) {
                    // The result of the first request is saved, and will be used to add more data in following requests (if any)
                    result = partialResult;
                } else {
                    // After requests that are not the first one, we just accumulate the destination addressses and the columns
                    // of the result, only for the first row as we have just one origin
                    ((List) result.get("destination_addresses")).addAll((List) partialResult.get("destination_addresses"));

                    // We add columns to the accumulated result rows.
                    List<Map> resultRows = (List<Map>) result.get("rows");
                    List<Map> partialResultRows = (List<Map>) partialResult.get("rows");
                    for (int rowIdx = 0; rowIdx < partialResultRows.size(); rowIdx++) {
                        ((List) resultRows.get(rowIdx).get("elements")).addAll(
                                (List) partialResultRows.get(rowIdx).get("elements"));
                    }

                }
            } catch (IOException ex) {
                Logger.getLogger(DistanceMatrixWebService.class.getName()).log(Level.SEVERE, null, ex);
                throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
            }

            HttpStatus responseStatus = HttpStatus.valueOf(response.getResponseCode());
            if (!responseStatus.is2xxSuccessful()) {
                throw new RestException(responseStatus, new String(response.getContent()), null);
            }
        }

        // We return the JSON representation for the result.
        return gson.toJson(result);
    }

    private String formatArray(String[] places) {
        return Joiner.on("|").skipNulls().join(places);
    }
}
