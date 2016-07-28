/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.snowdropsolutions.tt.services;

import com.snowdropsolutions.tt.dtos.Station;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import org.springframework.stereotype.Service;

/**
 *
 * @author amartinez
 */
@Service
public class DBService {

    static final int DECIMALS = 3;

    /**
     *
     * @return stmn
     * @throws ServletException
     */
    private Connection dbConnect() throws ServletException {
        Connection conn = null;
        String url;
        if (System
                .getProperty("com.google.appengine.runtime.version").startsWith("Google App Engine/")) {
            // Check the System properties to determine if we are running on appengine or not
            // Google App Engine sets a few system properties that will reliably be present on a remote
            // instance.
            url = System.getProperty("ae-cloudsql.cloudsql-database-url");
            try {
                // Load the class that provides the new "jdbc:google:mysql://" prefix.
                Class.forName("com.mysql.jdbc.GoogleDriver");
            } catch (ClassNotFoundException e) {
                throw new ServletException("Error loading Google JDBC Driver", e);
            }
        } else {
            // Set the url with the local MySQL database connection url when running locally
            url = System.getProperty("ae-cloudsql.local-database-url");
            try {
                Class.forName("com.mysql.jdbc.Driver");
            } catch (ClassNotFoundException e) {
                throw new ServletException("Error loading JDBC Driver", e);
            }
        }

        try {
            // Open a connection
            System.out.println("Connecting to database...");
            conn = DriverManager.getConnection(url);
            return conn;
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        return conn;
    }

    /**
     *
     * @param query the query
     * @return result
     */
    public ArrayList<String> sqlQuery(String query) {
        ArrayList<String> points = new ArrayList<>();
        Connection conn = null;
        long sTime = System.currentTimeMillis();
        try {
            conn = dbConnect();
            try {
                try (PreparedStatement smt = conn.prepareStatement(query)) {
                    long startTime = System.currentTimeMillis();
                    ResultSet rs = smt.executeQuery(query);
                    long endTime = System.currentTimeMillis();
                    System.out.println("TIME:Query:  " + (endTime - startTime));
                    while (rs.next()) {
                        BigDecimal lat = new BigDecimal(rs.getDouble(1));
                        lat = lat.setScale(DECIMALS, BigDecimal.ROUND_CEILING);

                        BigDecimal lng = new BigDecimal(rs.getDouble(2));
                        lng = lng.setScale(DECIMALS, BigDecimal.ROUND_CEILING);

                        Station station = new Station(lat.doubleValue(), lng.doubleValue());
                        points.add(station.getCoord());
                    }
                    rs.close();
                    smt.close();
                }
            } catch (Exception e) {
                Logger.getLogger(DBService.class.getName()).log(Level.SEVERE, null, e);
            }

            conn.close();
        } catch (ServletException | SQLException ex) {
            Logger.getLogger(DBService.class.getName()).log(Level.SEVERE, null, ex);
        }
        long eTime = System.currentTimeMillis();
        System.out.println("TIME:Proccess result set:  " + (eTime - sTime));
        return points;
    }
}
