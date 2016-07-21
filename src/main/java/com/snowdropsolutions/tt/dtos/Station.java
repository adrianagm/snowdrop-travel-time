/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.snowdropsolutions.tt.dtos;

/**
 *
 * @author amartinez
 */
public class Station {

    private Double lat;
    private Double lng;
    private String coord;

    /**
     *
     * @param lat the latitude
     * @param lng the longitude
     */
    public Station(Double lat, Double lng) {
        this.lat = lat;
        this.lng = lng;
        this.coord = lat + "," + lng;
    }

    /**
     * @return the lat
     */
    public Double getLat() {
        return lat;
    }

    /**
     * @return the lng
     */
    public Double getLng() {
        return lng;
    }

    /**
     * @return the coord
     */
    public String getCoord() {
        return coord;
    }

    /**
     * @param lat the lat
     */
    public void setLat(Double lat) {
        this.lat = lat;
    }

    /**
     * @param lng the lng
     */
    public void setLng(Double lng) {
        this.lng = lng;
    }

    /**
     * @param coord the coord
     */
    public void setCoord(String coord) {
        this.coord = coord;
    }
}
