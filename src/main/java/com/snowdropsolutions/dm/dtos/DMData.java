/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.snowdropsolutions.dm.dtos;

import java.util.ArrayList;

/**
 *
 * @author amartinez
 */
public class DMData {

    private ArrayList origins;
    private ArrayList destinations;
    private String mode;
    private String avoid;
    private String units;
    private String transitMode;
    private String transitRoutingPreference;

    /**
     * @return the origins
     */
    public ArrayList getOrigins() {
        return origins;
    }

    /**
     * @return the destinations
     */
    public ArrayList getDestinations() {
        return destinations;
    }

    /**
     * @return the mode
     */
    public String getMode() {
        return mode;
    }

    /**
     * @return the avoid
     */
    public String getAvoid() {
        return avoid;
    }

    /**
     * @return the units
     */
    public String getUnits() {
        return units;
    }

    /**
     * @return the transitMode
     */
    public String getTransitMode() {
        return transitMode;
    }

    /**
     * @return the transitRoutingPreference
     */
    public String getTransitRoutingPreference() {
        return transitRoutingPreference;
    }

    /**
     * @param origins the origins to set
     */
    public void setOrigins(ArrayList origins) {
        this.origins = origins;
    }

    /**
     * @param destinations the destinations to set
     */
    public void setDestinations(ArrayList destinations) {
        this.destinations = destinations;
    }

    /**
     * @param mode the mode to set
     */
    public void setMode(String mode) {
        this.mode = mode;
    }

    /**
     * @param avoid the avoid to set
     */
    public void setAvoid(String avoid) {
        this.avoid = avoid;
    }

    /**
     * @param units the units to set
     */
    public void setUnits(String units) {
        this.units = units;
    }

    /**
     * @param transitMode the transitMode to set
     */
    public void setTransitMode(String transitMode) {
        this.transitMode = transitMode;
    }

    /**
     * @param transitRoutingPreference the transitRoutingPreference to set
     */
    public void setTransitRoutingPreference(String transitRoutingPreference) {
        this.transitRoutingPreference = transitRoutingPreference;
    }

}
