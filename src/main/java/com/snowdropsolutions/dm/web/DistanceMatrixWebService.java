package com.snowdropsolutions.dm.web;

import com.snowdropsolutions.dm.services.DistanceMatrixService;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Provides a web service endpoint for making signed requests to Google's DistanceMatrix API.
 *
 * @author lroman
 */
@RestController
@RequestMapping(value = "/")
public class DistanceMatrixWebService extends BaseRestWebService {

    @Autowired
    private DistanceMatrixService dmService;

    private static final Logger LOG = Logger.getLogger(DistanceMatrixWebService.class.getName());

    @RequestMapping(value = "dm", produces = "application/json")
    public void retrieveDM(
            @RequestParam("origins") String origins,
            @RequestParam("destinations") String destinations,
            @RequestParam(value = "mode", required = false) String mode,
            @RequestParam(value = "avoid", required = false) String avoid,
            HttpServletResponse response) throws IOException {

        LOG.log(Level.INFO, "Received queryString: origins={0} destinations={1}", new String[]{origins, destinations});

        String content = dmService.retrieveDM(origins, destinations, mode, avoid);

        response.addHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Access-Control-Allow-Headers", "Content-Type");
        response.addHeader("Content-Type", "application/json");

        response.getOutputStream().print(content);
    }
}
