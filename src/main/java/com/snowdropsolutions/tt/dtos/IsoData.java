/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.snowdropsolutions.tt.dtos;

import java.util.List;

/**
 *
 * @author amartinez
 */
public class IsoData {

    private String origin;
    private String mode;
    private String avoid;
    private String units;
    private String transitMode;
    private String transitRoutingPreference;
    private List<String> timeIntervals;
    private List<String> distanceIntervals;
    private String paramInterval;

    /**
     * @return the origin
     */
    public String getOrigin() {
        return origin;
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
     * @return the timeIntervals
     */
    public List<String> getTimeIntervals() {
        return timeIntervals;
    }

    /**
     * @return the distanceIntervals
     */
    public List<String> getDistanceIntervals() {
        return distanceIntervals;
    }

    /**
     * @return the paramInterval
     */
    public String getParamInterval() {
        return paramInterval;
    }

    /**
     * @param origin the origin to set
     */
    public void setOrigin(String origin) {
        this.origin = origin;
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

    /**
     * @param timeIntervals the timeIntervals to set
     */
    public void setTimeIntervals(List<String> timeIntervals) {
        this.timeIntervals = timeIntervals;
    }

    /**
     * @param distanceIntervals the distanceIntervals to set
     */
    public void setDistanceIntervals(List<String> distanceIntervals) {
        this.distanceIntervals = distanceIntervals;
    }

    /**
     * @param paramInterval the paramInterval to set
     */
    public void setParamInterval(String paramInterval) {
        this.paramInterval = paramInterval;
    }

}
