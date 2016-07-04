package com.snowdropsolutions.tt.web;

import com.emergya.spring.gae.web.ws.BaseRestWebService;
import com.snowdropsolutions.tt.dtos.IsoData;
import com.snowdropsolutions.tt.services.TravelTimeService;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Provides a web service endpoint for making signed requests to Google's
 * DistanceMatrix API.
 *
 * @author lroman
 */
@RestController
@RequestMapping(value = "/")
public class SnowdropTravelTimeWebService extends BaseRestWebService {

    private static final Logger LOG = Logger.getLogger(SnowdropTravelTimeWebService.class.getName());

    @Value("${dm.allowedOrigins}")
    private String allowedOrigins;

    @Autowired
    private TravelTimeService ttService;

    /**
     * Handles requests to the distance matrix proxy service.
     *
     * Not to be called manually, but in the context of an Spring MVC request.
     *
     * @param isoData the isoParam
     * @param response the response.
     */
    @RequestMapping(value = "iso", method = RequestMethod.POST)
    public void retrieveDM(@RequestBody IsoData isoData,
            HttpServletResponse response) {

        try {
            response.addHeader("Access-Control-Allow-Origin", allowedOrigins);
            response.addHeader("Access-Control-Allow-Headers", "Content-Type");
            response.addHeader("Content-Type", "application/json");

            String content = ttService.retrieveIso(isoData);
            //Add pre and post content, necessary to return valid JSON
            response.getOutputStream().print(content);
        } catch (IOException ex) {
            Logger.getLogger(SnowdropTravelTimeWebService.class.getName()).log(Level.SEVERE, null, ex);
            throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
        }
    }
}
