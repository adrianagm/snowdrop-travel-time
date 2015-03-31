package com.snowdropsolutions.dm.web;

import com.snowdropsolutions.dm.services.DistanceMatrixService;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
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

    @RequestMapping(value = "dm", method = RequestMethod.POST)
    public void retrieveDM(
            HttpServletRequest request,
            @RequestParam(value = "origins[]", required = false) String[] origins,
            @RequestParam(value = "destinations[]", required = false) String[] destinations,
            @RequestParam(value = "mode", required = false) String mode,
            @RequestParam(value = "avoid", required = false) String avoid,
            HttpServletResponse response) throws IOException {

        LOG.log(Level.INFO, "Received queryString -> origins: {0} destinations: {1}", new String[]{origins[0], destinations[0]});
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Access-Control-Allow-Headers", "Content-Type");
        response.addHeader("Content-Type", "application/json");

        String content = dmService.retrieveDM(origins, destinations, mode, avoid);

        //Add pre and post content, necessary to return valid JSON
        response.getOutputStream().print(content);
    }
}
