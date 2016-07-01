package com.snowdropsolutions.dm.web;

import com.emergya.spring.gae.web.ws.BaseRestWebService;
import com.snowdropsolutions.dm.dtos.DMData;
import com.snowdropsolutions.dm.services.DistanceMatrixService;
import java.io.IOException;
import java.util.ArrayList;
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
public class DistanceMatrixWebService extends BaseRestWebService {

    private static final Logger LOG = Logger.getLogger(DistanceMatrixWebService.class.getName());

    @Value("${dm.allowedOrigins}")
    private String allowedOrigins;

    @Autowired
    private DistanceMatrixService dmService;

    /**
     * Handles requests to the distance matrix proxy service.
     *
     * Not to be called manually, but in the context of an Spring MVC request.
     *
     * @param dmData the dmParam
     * @param response the response.
     */
    @RequestMapping(value = "dm", method = RequestMethod.POST)
    public void retrieveDM(@RequestBody DMData dmData,
            HttpServletResponse response) {

        try {
            response.addHeader("Access-Control-Allow-Origin", allowedOrigins);
            response.addHeader("Access-Control-Allow-Headers", "Content-Type");
            response.addHeader("Content-Type", "application/json");
            ArrayList listOrigins = dmData.getOrigins();
            if (listOrigins == null || listOrigins.isEmpty()) {
                Logger.getLogger(DistanceMatrixWebService.class.getName()).log(Level.SEVERE, null);
                throw new IOException("Origins param is required");
            }

            ArrayList listDestinations = dmData.getDestinations();
            if (listDestinations == null || listDestinations.isEmpty()) {
                Logger.getLogger(DistanceMatrixWebService.class.getName()).log(Level.SEVERE, null);
                throw new IOException("Destinations param is required");
            }

            String[] origins = (String[]) listOrigins.toArray(new String[listOrigins.size()]);
            String[] destinations = (String[]) listDestinations.toArray(new String[listDestinations.size()]);
            String content = dmService.retrieveDM(origins, destinations, dmData.getMode(),
                    dmData.getAvoid(), dmData.getUnits(), dmData.getTransitMode(), dmData.getTransitRoutingPreference());
            //Add pre and post content, necessary to return valid JSON
            response.getOutputStream().print(content);
        } catch (IOException ex) {
            Logger.getLogger(DistanceMatrixWebService.class.getName()).log(Level.SEVERE, null, ex);
            throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
        }
    }
}
