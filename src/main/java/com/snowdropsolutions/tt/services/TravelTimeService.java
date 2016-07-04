package com.snowdropsolutions.tt.services;

import com.emergya.spring.gae.web.ws.BaseRestWebService.RestException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.appengine.repackaged.com.google.api.client.util.ArrayMap;
import com.snowdropsolutions.tt.dtos.IsoData;
import com.snowdropsolutions.tt.web.SnowdropTravelTimeWebService;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Implements a Google Maps services's backed DistanceMatrix web service.
 *
 * @author lroman
 */
@Service
public class TravelTimeService {

    @Value("${tt.iso.url}")
    private String ISO_URL;

    @Value("${tt.dm.url}")
    private String DM_URL;

    /**
     * Performs requests (one or several, depending on the number of imputs) to
     * Travel Time DistanceMatrix service and returns the result.
     *
     * @param isoData the isoData
     * @return the Travel Time Distance Matrix service provided result.
     */
    public String retrieveIso(IsoData isoData) {
        try {
            String origin = isoData.getOrigin();
            if (origin == null) {
                Logger.getLogger(SnowdropTravelTimeWebService.class.getName()).log(Level.SEVERE, null);
                throw new IOException("Origin param is required");
            }

            String mode = isoData.getMode();
            if (mode == null) {
                Logger.getLogger(SnowdropTravelTimeWebService.class.getName()).log(Level.SEVERE, null);
                throw new IOException("Mode param is required");
            }

            switch (mode.toLowerCase()) {
                case "walking":
                case "driving":
                    return retrieveOTPIso(isoData);
                case "transit":
                    return retrieveGoogleIso(isoData);
                default:
                    return null;
            }
        } catch (IOException ex) {
            Logger.getLogger(SnowdropTravelTimeWebService.class.getName()).log(Level.SEVERE, null, ex);
            throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
        }
    }

    private String retrieveOTPIso(IsoData isoData) {
        String origin = isoData.getOrigin();
        String mode = isoData.getMode().toLowerCase();
        switch (mode) {
            case "walking":
                mode = "WALK";
                break;
            case "driving":
                mode = "CAR";
                break;
        }
        Map<String, String> requestMap = new ArrayMap<>();
        requestMap.put("algorithm", "accSampling");
        requestMap.put("fromPlace", isoData.getOrigin());
        requestMap.put("mode", mode);
        try {
            ArrayList intervalsList = isoData.getIntervals();
            if (intervalsList == null || intervalsList.isEmpty()) {
                Logger.getLogger(TravelTimeService.class.getName()).log(Level.SEVERE, null);
                throw new IOException("Intervals param is required");
            }
            String[] intervals = (String[]) intervalsList.toArray(new String[intervalsList.size()]);
            for (String timeInterval : intervals) {
                requestMap.put("cutoffSec", timeInterval);
                //String url = ISO_URL + mapToQueryString(requestMap);
                //getHttpResult(url);
            }
        } catch (IOException ex) {
            throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
        }

        return origin + ", " + mode;
    }

    private String retrieveGoogleIso(IsoData isoData) {
        return "";
    }

    /* public String mapToQueryString(Map<String, String> map) {
     StringBuilder string = new StringBuilder();

     if (map.size() > 0) {
     string.append("?");
     }

     for (Entry<String, String> entry : map.entrySet()) {
     string.append(entry.getKey());
     string.append("=");
     string.append(entry.getValue());
     string.append("&");
     }

     return string.toString();
     }*/
    /**
     *
     * @param url
     * @return
     * @throws ProtocolException
     * @throws IOException
     */
    private Map<String, Object> getHttpResult(String url) throws ProtocolException, IOException {
        URL statusURL = new URL(url);
        HttpURLConnection statusConnection = (HttpURLConnection) statusURL.openConnection();
        statusConnection.setReadTimeout(0);
        statusConnection.setRequestMethod("GET");

        try (InputStream responseStream = statusConnection.getInputStream()) {
            if (statusConnection.getResponseCode() != 200 && statusConnection.getResponseCode() != 204) {
                String msgError = "";
                Map<String, Object> result = new HashMap<>();
                result = new ObjectMapper().readValue(responseStream, result.getClass());
                if (result.get("error") != null) {
                    ArrayList<String> errors = (ArrayList<String>) result.get("error");
                    msgError = errors.get(0);
                }
                throw new RuntimeException("msgError: " + msgError + " \nCode: " + String.valueOf(statusConnection.getResponseCode() + " \nUrl: " + url));
            }
            Map<String, Object> result = new HashMap<>();
            return new ObjectMapper().readValue(responseStream, result.getClass());
        }
    }

    /**
     *
     * @param url
     * @return
     * @throws ProtocolException
     * @throws IOException
     */
    private Map<String, Object> postHttpResult(String request, String urlParameters) throws ProtocolException, IOException {
        // creates a unique boundary based on time stamp
        byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8);
        int postDataLength = postData.length;
        URL url = new URL(request);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setInstanceFollowRedirects(false);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setRequestProperty("charset", "utf-8");
        conn.setRequestProperty("Content-Length", Integer.toString(postDataLength));
        conn.setUseCaches(false);
        conn.setChunkedStreamingMode(0);
        try (DataOutputStream wr = new DataOutputStream(conn.getOutputStream())) {
            wr.write(postData);
            wr.close();
        }
        // checks server's status code first
        conn.setReadTimeout(60000);
        conn.setConnectTimeout(60000);
        int status = conn.getResponseCode();
        try (InputStream responseStream = conn.getInputStream()) {
            if (status != HttpURLConnection.HTTP_OK && status != HttpURLConnection.HTTP_NO_CONTENT) {
                String msgError = "";
                Map<String, Object> result = new HashMap<>();
                result = new ObjectMapper().readValue(responseStream, result.getClass());
                if (result.get("error") != null) {
                    ArrayList<String> errors = (ArrayList<String>) result.get("error");
                    msgError = errors.get(0);
                }
                throw new RuntimeException("msgError: " + msgError + " \nCode: " + String.valueOf(status + " \nURL: " + url + "\nUrlParameters: " + urlParameters));
            }
            Map<String, Object> result = new HashMap<>();
            return new ObjectMapper().readValue(responseStream, result.getClass());
        }
    }

}
