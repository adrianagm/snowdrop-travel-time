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
        //If distance from origin is less than 10km, get stations each 0.5km
        //If distance from origin is less than 100km, get stations each 1km
        //else, get stations each 5km
        String query = String.format("SELECT *, (6373 * "
                + "acos ( cos ( radians(%1$s ) )"
                + "      * cos( radians( Latitude ) )"
                + "      * cos( radians( Longitude ) - radians(%2$s ) )"
                + "      + sin ( radians( %1$s ) )"
                + "      * sin( radians( Latitude ) )"
                + "    )"
                + ") AS distance "
                + "FROM StopsGB "
                + "GROUP BY IF(distance<100,"
                + " IF(distance < 10, "
                + "(concat(0.5 * round(distance / 0.5), '-', 0.5 * round(distance / 0.5) + 0.5)), "
                + "(concat(1 * round(distance / 1), '-', 1 * round(distance / 1) + 1))), "
                + "(concat(5 * round(distance / 5), '-', 5 * round(distance / 5) + 5.1))) "
                + "HAVING distance < %3$s "
                + "ORDER BY distance", lat, lng, String.valueOf(radius));

        ArrayList<String> stations = dbService.sqlQuery(query);

        return stations;
    }

}
