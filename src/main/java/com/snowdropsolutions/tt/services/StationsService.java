/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.snowdropsolutions.tt.services;

import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author amartinez
 */
@Service
public class StationsService {

    static final double TRAMO_1 = 0.08;
    static final double TRAMO_2 = 0.1;
    static final double TRAMO_3 = 0.5;

    @Autowired
    private DBService dbService;

    /**
     *
     * @return stations
     *
     */
    public List<String> getStations() {
        String query = "SELECT Latitude, Longitude FROM StopsGB ";
        List<String> stations = dbService.sqlQuery(query);
        return stations;
    }

    /**
     * @param origin the origin point
     * @param radius the radius
     * @return stations
     *
     */
    public ArrayList<String> getStationsByRadius(String origin, double radius) {
        String lat = origin.split(",")[0];
        String lng = origin.split(",")[1];

        String query = String.format("SELECT latitude, longitude, "
                + "IF(a.distance<80,"
                + "IF(a.distance < 40,"
                + "(ROUND(a.latitude /%4$s) * %4$s),"
                + "(ROUND(a.latitude / %5$s) * %5$s)),(ROUND(a.latitude /%6$s) * %6$s)"
                + ") AS rlat,"
                + "IF(a.distance<80,"
                + "IF(a.distance < 40,"
                + "(ROUND(a.longitude / %4$s) * %4$s),"
                + "(ROUND(a.longitude / %5$s) * %5$s)),(ROUND(a.longitude /%6$s) * %6$s)"
                + ") AS rlng "
                + " FROM("
                + " SELECT latitude, longitude,"
                + " ST_Distance(point(Latitude,Longitude), point(%1$s, %2$s))*100  AS distance"
                + " FROM StopsWales HAVING distance <%3$s) as a"
                + " GROUP BY rlat, rlng"
                + " ORDER BY distance", lat, lng, String.valueOf(radius), TRAMO_1, TRAMO_2, TRAMO_3);

        ArrayList<String> stations = dbService.sqlQuery(query);

        return stations;
    }

}
