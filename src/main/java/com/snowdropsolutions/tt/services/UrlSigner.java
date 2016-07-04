package com.snowdropsolutions.tt.services;

import com.google.appengine.repackaged.com.google.api.client.util.Base64;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Class used to sign requests to Google's DistanceMatrix service, taken from
 * https://developers.google.com/maps/documentation/business/webservices#JavaSignatureExample.
 *
 * @author lroman
 */
@Component
public class UrlSigner {

    @Value("${dm.googleApi.privateKey}")
    private String keyString;

    @Value("${dm.googleApi.clientId}")
    private String clientId;

    // This variable stores the binary key, which is computed from the string (Base64) key
    private byte[] key;

    /**
     * Creates a valid Google Maps APIs signed URL from the server resource and
     * query parameters.
     *
     * @param resource The service url you want to access (e.g. DistanceMatrix
     * API service's URL).
     * @param query The parameters for the requests to be done.
     * @return the signed request.
     */
    public String signRequest(String resource, String query) {

        try {
            // Retrieve the proper URL components to sign
            String url = resource + '?' + query + "&client=" + clientId;

            initializeKey();

            // Get an HMAC-SHA1 signing key from the raw key bytes
            SecretKeySpec sha1Key = new SecretKeySpec(key, "HmacSHA1");

            // Get an HMAC-SHA1 Mac instance and initialize it with the HMAC-SHA1 key
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(sha1Key);

            // compute the binary signature for the request
            byte[] sigBytes = mac.doFinal(url.getBytes("UTF-8"));

            // base 64 encode the binary signature
            String signature = Base64.encodeBase64String(sigBytes);

            // convert the signature to 'web safe' base 64
            signature = signature.replace('+', '-');
            signature = signature.replace('/', '_');

            return url + "&signature=" + signature;
        } catch (NoSuchAlgorithmException | UnsupportedEncodingException | InvalidKeyException ex) {
            Logger.getLogger(UrlSigner.class.getName()).log(Level.SEVERE, null, ex);
            throw new RuntimeException(ex);
        }
    }

    private void initializeKey() {
        if (key == null) {
            // Convert the key from 'web safe' base 64 to binary
            keyString = keyString.replace('-', '+');
            keyString = keyString.replace('_', '/');
            System.out.println("Key: " + keyString);
            key = Base64.decodeBase64(keyString);
        }
    }
}
