package com.hudapp;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.here.sdk.core.GeoCoordinates;
import com.here.sdk.core.engine.SDKNativeEngine;
import com.here.sdk.core.engine.SDKOptions;
import com.here.sdk.core.errors.InstantiationErrorException;
import com.here.sdk.navigation.LaneAssistance;
import com.here.sdk.navigation.LaneRecommendation;
import com.here.sdk.navigation.NavigableLocation;
import com.here.sdk.navigation.VisualNavigator;
import com.here.sdk.routing.CalculateRouteCallback;
import com.here.sdk.routing.CarOptions;
import com.here.sdk.routing.Route;
import com.here.sdk.routing.RoutingEngine;
import com.here.sdk.routing.Waypoint;

import java.util.ArrayList;
import java.util.List;

/**
 * Native module for HERE SDK lane guidance
 * Provides lane-by-lane navigation data to React Native
 */
public class HereLaneGuidanceModule extends ReactContextBaseJavaModule {
    private static final String TAG = "HereLaneGuidance";
    private static final String MODULE_NAME = "HereLaneGuidance";

    private ReactApplicationContext reactContext;
    private VisualNavigator visualNavigator;
    private RoutingEngine routingEngine;
    private Route currentRoute;

    public HereLaneGuidanceModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * Initialize HERE SDK
     */
    @ReactMethod
    public void initializeSDK(String accessKeyId, String accessKeySecret, Promise promise) {
        try {
            SDKOptions sdkOptions = new SDKOptions(accessKeyId, accessKeySecret);
            SDKNativeEngine.makeSharedInstance(reactContext, sdkOptions);

            // Initialize routing engine
            try {
                routingEngine = new RoutingEngine();
            } catch (InstantiationErrorException e) {
                promise.reject("SDK_INIT_ERROR", "Failed to initialize routing engine: " + e.getMessage());
                return;
            }

            // Initialize visual navigator for lane guidance
            try {
                visualNavigator = new VisualNavigator();

                // Listen for lane assistance updates
                visualNavigator.setLaneAssistanceListener(laneAssistance -> {
                    sendLaneGuidanceEvent(laneAssistance);
                });

                promise.resolve("SDK initialized successfully");
            } catch (InstantiationErrorException e) {
                promise.reject("SDK_INIT_ERROR", "Failed to initialize navigator: " + e.getMessage());
            }

        } catch (Exception e) {
            promise.reject("SDK_INIT_ERROR", e.getMessage());
        }
    }

    /**
     * Calculate route and start navigation
     */
    @ReactMethod
    public void startNavigation(
            double originLat, double originLng,
            double destLat, double destLng,
            Promise promise
    ) {
        if (routingEngine == null) {
            promise.reject("NOT_INITIALIZED", "SDK not initialized. Call initializeSDK first.");
            return;
        }

        Waypoint origin = new Waypoint(new GeoCoordinates(originLat, originLng));
        Waypoint destination = new Waypoint(new GeoCoordinates(destLat, destLng));

        List<Waypoint> waypoints = new ArrayList<>();
        waypoints.add(origin);
        waypoints.add(destination);

        routingEngine.calculateRoute(waypoints, new CarOptions(), new CalculateRouteCallback() {
            @Override
            public void onRouteCalculated(@NonNull com.here.sdk.routing.RoutingError routingError,
                                          List<Route> routes) {
                if (routingError == null && routes != null && !routes.isEmpty()) {
                    currentRoute = routes.get(0);

                    // Start visual navigation with lane guidance
                    if (visualNavigator != null) {
                        visualNavigator.setRoute(currentRoute);
                    }

                    promise.resolve("Navigation started");
                } else {
                    String errorMessage = routingError != null ? routingError.toString() : "Unknown error";
                    promise.reject("ROUTING_ERROR", "Route calculation failed: " + errorMessage);
                }
            }
        });
    }

    /**
     * Update current location (called repeatedly during navigation)
     */
    @ReactMethod
    public void updateLocation(double lat, double lng, double speed, double bearing) {
        if (visualNavigator != null && currentRoute != null) {
            NavigableLocation location = new NavigableLocation(
                    new GeoCoordinates(lat, lng),
                    (float) bearing,
                    (float) speed,
                    System.currentTimeMillis()
            );

            visualNavigator.onLocationUpdated(location);
        }
    }

    /**
     * Stop navigation
     */
    @ReactMethod
    public void stopNavigation() {
        if (visualNavigator != null) {
            visualNavigator.setRoute(null);
            currentRoute = null;
        }
    }

    /**
     * Send lane guidance data to React Native
     */
    private void sendLaneGuidanceEvent(LaneAssistance laneAssistance) {
        if (laneAssistance == null) {
            return;
        }

        WritableArray lanesArray = new WritableNativeArray();

        for (LaneRecommendation lane : laneAssistance.lanesForNextManeuver) {
            WritableMap laneMap = new WritableNativeMap();

            // Lane directions (e.g., ["left"], ["straight"], ["left", "straight"])
            WritableArray directionsArray = new WritableNativeArray();
            for (com.here.sdk.navigation.LaneDirection direction : lane.directions) {
                directionsArray.pushString(direction.toString().toLowerCase());
            }
            laneMap.putArray("directions", directionsArray);

            // Is this lane recommended for the current route?
            laneMap.putBoolean("recommended", lane.recommendationState ==
                    com.here.sdk.navigation.LaneRecommendationState.RECOMMENDED);

            lanesArray.pushMap(laneMap);
        }

        // Send event to React Native
        WritableMap eventData = new WritableNativeMap();
        eventData.putArray("lanes", lanesArray);
        eventData.putInt("distanceToManeuver", laneAssistance.distanceToManeuverInMeters);

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onLaneGuidanceUpdated", eventData);
    }
}
