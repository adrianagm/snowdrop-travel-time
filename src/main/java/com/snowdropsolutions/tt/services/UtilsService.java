/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.snowdropsolutions.tt.services;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.json.simple.JSONObject;
import org.springframework.stereotype.Service;

/**
 *
 * @author amartinez
 */
@Service
public class UtilsService {

    static final int TIMEOUT = 6000;
    static final int OK = 200;
    static final int NO_CONTENT = 204;

    /**
     * @param map the map
     * @return the query string.
     */
    public String mapToQueryString(Map<String, String> map) {
        StringBuilder string = new StringBuilder();

        if (map.size() > 0) {
            string.append("?");
        }

        for (Map.Entry<String, String> entry : map.entrySet()) {
            string.append(entry.getKey());
            string.append("=");
            string.append(entry.getValue());
            string.append("&");
        }

        return string.toString();
    }

    /**
     * @param map the map
     * @return the query string.
     */
    public String mapToQueryJson(Map<String, Object> map) {
        JSONObject json = new JSONObject();
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            json.put(entry.getKey(), entry.getValue());
        }
        return json.toString();
    }

    /**
     *
     * @param url the url
     * @return result the result
     * @throws ProtocolException the ex
     * @throws IOException the ex
     */
    public Map<String, Object> getHttpResult(String url) throws ProtocolException, IOException {
        URL statusURL = new URL(url);
        HttpURLConnection statusConnection = (HttpURLConnection) statusURL.openConnection();
        statusConnection.setReadTimeout(0);
        statusConnection.setRequestMethod("GET");

        try (InputStream responseStream = statusConnection.getInputStream()) {
            if (statusConnection.getResponseCode() != OK && statusConnection.getResponseCode() != NO_CONTENT) {
                String msgError = "";
                Map<String, Object> result = new HashMap<>();
                result = new ObjectMapper().readValue(responseStream, result.getClass());
                if (result.get("error") != null) {
                    ArrayList<String> errors = (ArrayList<String>) result.get("error");
                    msgError = errors.get(0);
                }
                throw new RuntimeException("msgError: " + msgError + " \nCode: "
                        + String.valueOf(statusConnection.getResponseCode() + " \nUrl: " + url));
            }
            Map<String, Object> result = new HashMap<>();
            return new ObjectMapper().readValue(responseStream, result.getClass());
        }
    }

    /**
     *
     * @param request the request
     * @param urlParameters the params
     * @return the result
     * @throws ProtocolException the ex
     * @throws IOException the ex
     */
    public Map<String, Object> postHttpResult(String request, String urlParameters) throws ProtocolException, IOException {
        // creates a unique boundary based on time stamp
        byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8);
        int postDataLength = postData.length;
        URL url = new URL(request);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setInstanceFollowRedirects(false);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("charset", "utf-8");
        conn.setRequestProperty("Content-Length", Integer.toString(postDataLength));
        conn.setUseCaches(false);
        conn.setChunkedStreamingMode(0);
        try (DataOutputStream wr = new DataOutputStream(conn.getOutputStream())) {
            wr.write(postData);
            wr.close();
        }
        // checks server's status code first
        conn.setReadTimeout(TIMEOUT);
        conn.setConnectTimeout(TIMEOUT);
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
                throw new RuntimeException("msgError: " + msgError + " \nCode: "
                        + String.valueOf(status + " \nURL: " + url + "\nUrlParameters: " + urlParameters));
            }
            Map<String, Object> result = new HashMap<>();
            return new ObjectMapper().readValue(responseStream, result.getClass());
        }
    }
}
