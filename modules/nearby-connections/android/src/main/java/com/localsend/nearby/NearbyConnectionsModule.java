package com.localsend.nearby;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.google.android.gms.nearby.Nearby;
import com.google.android.gms.nearby.connection.*;

import android.net.Uri;
import android.util.Log;
import java.io.File;

public class NearbyConnectionsModule extends ReactContextBaseJavaModule {
    private static final String TAG = "NearbyConnections";
    private static final String SERVICE_ID = "com.localsend.nearbyshare";
    private static final Strategy STRATEGY = Strategy.P2P_CLUSTER;

    private final ReactApplicationContext reactContext;
    private ConnectionsClient connectionsClient;

    public NearbyConnectionsModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.connectionsClient = Nearby.getConnectionsClient(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "NearbyConnectionsModule";
    }

    private void sendEvent(String eventName, WritableMap params) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    @ReactMethod
    public void startAdvertising(String deviceName, Promise promise) {
        AdvertisingOptions options = new AdvertisingOptions.Builder().setStrategy(STRATEGY).build();
        connectionsClient
            .startAdvertising(deviceName, SERVICE_ID, connectionLifecycleCallback, options)
            .addOnSuccessListener(unused -> {
                Log.d(TAG, "Advertising started");
                promise.resolve(deviceName);
            })
            .addOnFailureListener(e -> {
                Log.e(TAG, "Advertising failed: " + e.getMessage());
                promise.reject("ADVERTISING_FAILED", e.getMessage());
            });
    }

    @ReactMethod
    public void stopAdvertising(Promise promise) {
        connectionsClient.stopAdvertising();
        promise.resolve(null);
    }

    @ReactMethod
    public void startDiscovery(Promise promise) {
        DiscoveryOptions options = new DiscoveryOptions.Builder().setStrategy(STRATEGY).build();
        connectionsClient
            .startDiscovery(SERVICE_ID, endpointDiscoveryCallback, options)
            .addOnSuccessListener(unused -> {
                Log.d(TAG, "Discovery started");
                promise.resolve(null);
            })
            .addOnFailureListener(e -> {
                Log.e(TAG, "Discovery failed: " + e.getMessage());
                promise.reject("DISCOVERY_FAILED", e.getMessage());
            });
    }

    @ReactMethod
    public void stopDiscovery(Promise promise) {
        connectionsClient.stopDiscovery();
        promise.resolve(null);
    }

    @ReactMethod
    public void requestConnection(String endpointId, String deviceName, Promise promise) {
        connectionsClient
            .requestConnection(deviceName, endpointId, connectionLifecycleCallback)
            .addOnSuccessListener(unused -> {
                Log.d(TAG, "Connection requested to: " + endpointId);
                promise.resolve(null);
            })
            .addOnFailureListener(e -> {
                Log.e(TAG, "Connection request failed: " + e.getMessage());
                promise.reject("CONNECTION_FAILED", e.getMessage());
            });
    }

    @ReactMethod
    public void acceptConnection(String endpointId, Promise promise) {
        connectionsClient.acceptConnection(endpointId, payloadCallback)
            .addOnSuccessListener(unused -> promise.resolve(null))
            .addOnFailureListener(e -> promise.reject("ACCEPT_FAILED", e.getMessage()));
    }

    @ReactMethod
    public void rejectConnection(String endpointId, Promise promise) {
        connectionsClient.rejectConnection(endpointId)
            .addOnSuccessListener(unused -> promise.resolve(null))
            .addOnFailureListener(e -> promise.reject("REJECT_FAILED", e.getMessage()));
    }

    @ReactMethod
    public void sendPayload(String endpointId, String fileUri, String fileName, Promise promise) {
        try {
            File file = new File(Uri.parse(fileUri).getPath());
            Payload filePayload = Payload.fromFile(file);
            
            connectionsClient.sendPayload(endpointId, filePayload)
                .addOnSuccessListener(unused -> {
                    Log.d(TAG, "Payload sent: " + fileName);
                    promise.resolve(String.valueOf(filePayload.getId()));
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Payload send failed: " + e.getMessage());
                    promise.reject("SEND_FAILED", e.getMessage());
                });
        } catch (Exception e) {
            promise.reject("FILE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void disconnect(String endpointId, Promise promise) {
        connectionsClient.disconnectFromEndpoint(endpointId);
        promise.resolve(null);
    }

    private final EndpointDiscoveryCallback endpointDiscoveryCallback =
        new EndpointDiscoveryCallback() {
            @Override
            public void onEndpointFound(String endpointId, DiscoveredEndpointInfo info) {
                WritableMap params = Arguments.createMap();
                params.putString("endpointId", endpointId);
                params.putString("name", info.getEndpointName());
                sendEvent("onEndpointDiscovered", params);
            }

            @Override
            public void onEndpointLost(String endpointId) {
                WritableMap params = Arguments.createMap();
                params.putString("endpointId", endpointId);
                sendEvent("onEndpointLost", params);
            }
        };

    private final ConnectionLifecycleCallback connectionLifecycleCallback =
        new ConnectionLifecycleCallback() {
            @Override
            public void onConnectionInitiated(String endpointId, ConnectionInfo connectionInfo) {
                WritableMap params = Arguments.createMap();
                params.putString("endpointId", endpointId);
                params.putString("name", connectionInfo.getEndpointName());
                sendEvent("onConnectionInitiated", params);
            }

            @Override
            public void onConnectionResult(String endpointId, ConnectionResolution result) {
                WritableMap params = Arguments.createMap();
                params.putString("endpointId", endpointId);
                params.putBoolean("success", result.getStatus().isSuccess());
                if (!result.getStatus().isSuccess()) {
                    params.putString("error", result.getStatus().getStatusMessage());
                }
                sendEvent("onConnectionResult", params);
            }

            @Override
            public void onDisconnected(String endpointId) {
                Log.d(TAG, "Disconnected: " + endpointId);
            }
        };

    private final PayloadCallback payloadCallback =
        new PayloadCallback() {
            @Override
            public void onPayloadReceived(String endpointId, Payload payload) {
                Log.d(TAG, "Payload received from: " + endpointId);
            }

            @Override
            public void onPayloadTransferUpdate(String endpointId, PayloadTransferUpdate update) {
                WritableMap params = Arguments.createMap();
                params.putString("endpointId", endpointId);
                params.putString("payloadId", String.valueOf(update.getPayloadId()));
                params.putString("status", getStatusString(update.getStatus()));
                params.putDouble("bytesTransferred", update.getBytesTransferred());
                params.putDouble("totalBytes", update.getTotalBytes());
                sendEvent("onPayloadTransferUpdate", params);
            }

            private String getStatusString(int status) {
                switch (status) {
                    case PayloadTransferUpdate.Status.SUCCESS: return "SUCCESS";
                    case PayloadTransferUpdate.Status.FAILURE: return "FAILURE";
                    case PayloadTransferUpdate.Status.IN_PROGRESS: return "IN_PROGRESS";
                    default: return "UNKNOWN";
                }
            }
        };
}
