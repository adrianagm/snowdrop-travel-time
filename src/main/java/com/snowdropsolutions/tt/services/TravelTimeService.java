package com.snowdropsolutions.tt.services;

import com.emergya.spring.gae.web.ws.BaseRestWebService.RestException;
import com.google.appengine.repackaged.com.google.api.client.util.ArrayMap;
import com.snowdropsolutions.tt.dtos.IsoData;
import com.snowdropsolutions.tt.web.SnowdropTravelTimeWebService;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Polygon;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.simple.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.wololo.geojson.GeoJSON;
import org.wololo.jts2geojson.GeoJSONReader;
import org.wololo.jts2geojson.GeoJSONWriter;

/**
 * Implements a Google Maps services's backed DistanceMatrix web service.
 *
 * @author amartinez
 */
@Service
public class TravelTimeService {

    //velocity
    static final int KM_H = 120;
    static final double TO_SEG = 3.6;
    static final int M_KM = 1000;

    @Value("${tt.iso.url}")
    private String isoUrl;

    @Value("${tt.dm.url}")
    private String dmUrl;

    @Autowired
    private StationsService stationsService;

    @Autowired
    private UtilsService utilsService;

    /*@Autowired
    TaskQueueService taskQueueService;*/
    /**
     * Performs requests (one or several, depending on the number of imputs) to
     * Travel Time DistanceMatrix service and returns the result.
     *
     * @param isoData the isoData
     * @return the Travel Time Distance Matrix service provided result.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> retrieveIso(IsoData isoData) {
        Map<String, Object> iso = null;
        try {
            String origin = isoData.getOrigin();
            if (origin == null) {
                throw new IOException("origin param is required");
            }

            String mode = isoData.getMode();
            if (mode == null) {
                throw new IOException("mode param is required");
            }
            List<String> intervals = isoData.getTimeIntervals();
            if (intervals == null) {
                intervals = isoData.getDistanceIntervals();
                if (intervals == null) {
                    throw new IOException("timeInterval or distanceIntervals param is required");
                } else {
                    isoData.setParamInterval("distance");
                }
            } else {
                isoData.setParamInterval("time");
            }

            switch (mode.toLowerCase()) {
                case "walking":
                case "driving":
                case "bicycle":
                    iso = retrieveOTPIso(isoData);
                    break;
                case "transit":
                    iso = retrieveGoogleIso(isoData);
                    break;
                default:
                    throw new IOException("Mode param is wrong");
            }
        } catch (IOException ex) {
            Logger.getLogger(SnowdropTravelTimeWebService.class.getName()).log(Level.SEVERE, null, ex);
            throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
        }

        return iso;
    }

    /**
     * @param isoData the isoData
     * @return the Geojson iso.
     */
    private Map<String, Object> retrieveOTPIso(IsoData isoData) {
        Map<String, Object> iso = null;
        String mode = isoData.getMode().toLowerCase();
        switch (mode) {
            case "walking":
                mode = "WALK";
                break;
            case "driving":
                mode = "CAR";
                break;
            case "bicycling":
                mode = "BICYCLE";
                break;
            default:
                mode = "CAR";
        }
        Map<String, String> requestMap = new ArrayMap<>();
        requestMap.put("algorithm", "accSampling");
        requestMap.put("batch", "true");
        requestMap.put("fromPlace", isoData.getOrigin());
        requestMap.put("mode", mode);
        StringBuffer requestIntervals = new StringBuffer();
        for (String interval : isoData.getTimeIntervals()) {
            requestIntervals.append("&cutoffSec=").append(interval);
        }
        String url = isoUrl + utilsService.mapToQueryString(requestMap) + requestIntervals;
        try {
            iso = utilsService.getHttpResult(url);
        } catch (Exception ex) {
            throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
        }

        return iso;
    }

    /**
     * @param isoData the isoData
     * @return the Geojson iso.
     */
    private Map<String, Object> retrieveGoogleIso(IsoData isoData) {
        ArrayList<Integer> intervals = new ArrayList<>();
        for (String interval : isoData.getTimeIntervals()) {
            intervals.add(Integer.valueOf(interval));
        }
        ArrayList<String> destinations = getDestinations(isoData.getOrigin(), Collections.max(intervals).toString());
        Map<String, Object> dm = getDM(isoData, destinations);
        return calculateIsoByDM(dm, isoData, destinations);
    }

    /**
     * @param origin the origin
     * @param timeInterval
     * @return the stations.
     */
    private ArrayList<String> getDestinations(String origin, String timeInterval) {
        double radius = calculateRadius(timeInterval);
        return stationsService.getStationsByRadius(origin, mToKm(radius));
    }

    /**
     *
     * @param timeInterval
     * @return radius to get stations
     */
    private double calculateRadius(String timeInterval) {
        double mSeg = KM_H / TO_SEG;
        double t = Double.parseDouble(timeInterval);
        double radius = t * mSeg;
        return radius;

    }

    /**
     *
     * @param radius
     * @return radius in km
     */
    private double mToKm(double radius) {
        return radius / M_KM;
    }

    /**
     *
     * @param isoData
     * @param stations
     * @return the distance matrix
     */
    private Map<String, Object> getDM(IsoData isoData, ArrayList<String> stations) {
        Map<String, Object> dm = null;
        Map<String, Object> requestMap = new ArrayMap<>();
        JSONArray origins = new JSONArray();
        origins.add(isoData.getOrigin());
        JSONArray destinations = new JSONArray();
        destinations.addAll(stations);
        requestMap.put("mode", "transit");
        requestMap.put("origins", origins);
        requestMap.put("destinations", destinations);
        try {
            //taskQueueService.registerTaskQueue("/tasks/dm", requestMap);
            dm = utilsService.postHttpResult(dmUrl, utilsService.mapToQueryJson(requestMap));
        } catch (Exception ex) {
            throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), ex);
        }
        return dm;
    }

    /**
     * @param dm the distance matrix
     * @return the iso
     */
    private Map<String, Object> calculateIsoByDM(Map<String, Object> dm, IsoData isoData, ArrayList<String> destinations) {
        int i = 0;
        List<String> intervals = isoData.getTimeIntervals();
        Double valueInterval = Double.parseDouble(Collections.max(intervals));
        ArrayList<Map<String, Object>> isoList = new ArrayList<>();
        ArrayList<Map<String, Object>> rows = (ArrayList<Map<String, Object>>) dm.get("rows");
        Map<String, Object> el = (Map<String, Object>) rows.get(0);
        ArrayList<Map<String, Object>> elements = (ArrayList<Map<String, Object>>) el.get("elements");
        //add walking iso from origin
        isoList.add(getIsoFromStation(isoData.getOrigin(), isoData.getTimeIntervals()));
        //add walking iso from each station
        for (Map<String, Object> entry : elements) {
            if (entry.get("status").equals("OK")) {
                Map<String, Object> duration = (Map<String, Object>) entry.get("duration");
                Double value = (Double) duration.get("value");
                if (value < valueInterval) {
                    List<String> intervalsForStation = getIntervalsForStation(value, intervals);
                    isoList.add(getIsoFromStation(destinations.get(i), intervalsForStation));
                }
            }
            i++;
        }
        return mergeDMIso(isoList);
    }

    /**
     * @param time the time
     * @param origin the origin
     * @return iso from station
     */
    private Map<String, Object> getIsoFromStation(String origin, List<String> intervals) {
        Map<String, Object> iso = new ArrayMap<>();
        IsoData isoData = new IsoData();
        isoData.setMode("walking");
        isoData.setOrigin(origin);
        isoData.setTimeIntervals(intervals);
        try {
            iso = retrieveOTPIso(isoData);
        } catch (Exception e) {
            System.out.print(e);
        }
        return iso;
    }

    private Map<String, Object> mergeDMIso(ArrayList<Map<String, Object>> isoList) {
        ArrayList<Map<String, Object>> isoIntervalList = new ArrayList<>();

        Map<String, Object> firstIso = isoList.get(0);
        ArrayList<Map<String, Object>> features = (ArrayList<Map<String, Object>>) firstIso.get("features");

        for (int i = 0; i < features.size(); i++) {
            Geometry iso = null;
            for (Map<String, Object> polygon : isoList) {
                ArrayList<Map<String, Object>> isofeatures = (ArrayList<Map<String, Object>>) polygon.get("features");
                if (isofeatures != null) {
                    Map<String, Object> geometry = (Map<String, Object>) isofeatures.get(i).get("geometry");
                    if (iso == null) {
                        iso = createPolygon(geometry);
                    } else {
                        try {
                            iso = iso.union(createPolygon(geometry));
                        } catch (Exception e) {
                            System.out.print(e);
                        }
                    }
                }
            }
            isoIntervalList.add(createFeature(iso, (Map<String, Object>) features.get(i).get("properties")));
        }

        return createGjson(isoIntervalList);

    }

    private Polygon createPolygon(Map<String, Object> geometry) {
        GeometryFactory gf = new GeometryFactory();
        Polygon pol = gf.createPolygon(new Coordinate[]{});
        ArrayList<Object> coordinates1 = (ArrayList<Object>) geometry.get("coordinates");
        if (coordinates1.isEmpty()) {
            return pol;
        }
        ArrayList<Object> coordinates2 = (ArrayList<Object>) coordinates1.get(0);
        ArrayList<List<Double>> coordinates = (ArrayList<List<Double>>) coordinates2.get(0);
        ArrayList<Coordinate> coordinateList = new ArrayList<>();
        for (List<Double> coor : coordinates) {
            coordinateList.add(new Coordinate(coor.get(0), coor.get(1)));
        }
        Coordinate[] cs = new Coordinate[coordinateList.size()];
        Coordinate[] cSec = (Coordinate[]) coordinateList.toArray(cs);
        pol = gf.createPolygon(cSec);
        return pol;
    }

    private Geometry createPolygonFromGjson(GeoJSON json) {
        GeoJSONReader reader = new GeoJSONReader();
        Geometry pol = reader.read(json);

        return pol;
    }

    private Map<String, Object> createFeature(Geometry iso, Map<String, Object> properties) {
        Map<String, Object> feature = new ArrayMap<>();
        feature.put("type", "Feature");
        feature.put("properties", properties);
        GeoJSONWriter writer = new GeoJSONWriter();
        GeoJSON geometry = writer.write(iso);
        feature.put("geometry", geometry);
        return feature;
    }

    private Map<String, Object> createGjson(ArrayList<Map<String, Object>> features) {
        Map<String, Object> gjson = new ArrayMap<>();
        gjson.put("type", "FeatureCollection");
        gjson.put("features", features);
        return gjson;

    }

    private List<String> getIntervalsForStation(Double value, List<String> intervals) {
        List<String> intervalsForStation = new ArrayList<>();
        for (String interval : intervals) {
            Double newInterval = Double.valueOf(interval) - value;
            intervalsForStation.add(String.valueOf(newInterval.intValue()));
        }
        return intervalsForStation;
    }

    /**
     * @param iso the complete iso
     * @return the clipping iso
     */
    public Map<String, Object> retrieveClipIso(Map<String, Object> iso) {
        ArrayList<Map<String, Object>> clipFeatures = new ArrayList<>();
        ArrayList<Map<String, Object>> features = (ArrayList<Map<String, Object>>) iso.get("features");
        Iterator<Map<String, Object>> iterator = features.iterator();
        int i = 0;

        while (iterator.hasNext()) {
            if (i < features.size() - 1) {
                Geometry pol = null, clipPol = null, resultPol = null;
                try {
                    Map<String, Object> geometry = (Map<String, Object>) features.get(i).get("geometry");
                    pol = createPolygon(geometry);
                } catch (Exception e) {
                    System.out.print(e);
                    GeoJSON geometry = (GeoJSON) features.get(i).get("geometry");
                    pol = createPolygonFromGjson(geometry);
                }
                try {
                    Map<String, Object> clipGeometry = (Map<String, Object>) features.get(i + 1).get("geometry");
                    clipPol = createPolygon(clipGeometry);
                } catch (Exception e) {
                    System.out.print(e);
                    GeoJSON clipGeometry = (GeoJSON) features.get(i + 1).get("geometry");
                    clipPol = createPolygonFromGjson(clipGeometry);
                }

                resultPol = pol.difference(clipPol);
                clipFeatures.add(createFeature(resultPol, (Map<String, Object>) features.get(i).get("properties")));
                i++;
            } else {
                clipFeatures.add(features.get(i));
            }
        }

        return createGjson(clipFeatures);

    }

    /**
     *
     * @param iso the iso
     * @return the iso with filter
     */
    public Map<String, Object> addFilterIso(Map<String, Object> iso) {
        ArrayList<Map<String, Object>> features = (ArrayList<Map<String, Object>>) iso.get("features");
        Map<String, Object> filterFeature = new ArrayMap<>();
        filterFeature.put("type", features.get(0).get("type"));
        filterFeature.put("geometry", features.get(0).get("geometry"));
        Map<String, Object> prop = new ArrayMap<>();
        prop.put("filter", true);
        filterFeature.put("properties", prop);
        features.add(filterFeature);
        return createGjson(features);
    }

}
