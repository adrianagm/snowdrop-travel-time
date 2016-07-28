package com.snowdropsolutions.tt.web;

import com.emergya.spring.gae.web.ws.BaseRestWebService;
import com.snowdropsolutions.tt.dtos.IsoData;
import com.snowdropsolutions.tt.services.TravelTimeService;
import java.util.Map;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Provides a web service endpoint for making signed requests to Google's
 * DistanceMatrix API.
 *
 * @author amartinez
 */
@RestController
@RequestMapping(value = "/")
public class SnowdropTravelTimeWebService extends BaseRestWebService {

    private static final Logger LOG = Logger.getLogger(SnowdropTravelTimeWebService.class.getName());

    @Value("${tt.allowedOrigins}")
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
     * @return iso
     */
    @CrossOrigin
    @RequestMapping(value = "iso", method = RequestMethod.POST)
    public Map<String, Object> retrieveDM(@RequestBody IsoData isoData,
            HttpServletResponse response) {

        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", allowedOrigins);
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");

        Map<String, Object> iso = ttService.retrieveIso(isoData);
        Map<String, Object> filterIso = ttService.addFilterIso(iso);
        return filterIso;
    }

}
