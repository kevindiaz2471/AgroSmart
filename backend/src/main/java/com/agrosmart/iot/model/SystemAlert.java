package com.agrosmart.iot.model;

public class SystemAlert {
    private String id;
    private String zoneId;
    private String zoneName;
    private String type; // CRITICAL, WARNING, INFO, SUCCESS
    private String priority; // ALTA, MEDIA, BAJA
    private String code; // Deduplication key (e.g. LOW_MOISTURE, TANK_EMPTY, SENSOR_OFFLINE, WATCHDOG, ANOMALY)
    private String message;
    private String recommendation;
    private String timestamp;
    private boolean resolved;

    public SystemAlert() {}

    public SystemAlert(String id, String zoneId, String zoneName, String type, String priority,
                       String code, String message, String recommendation, String timestamp, boolean resolved) {
        this.id = id;
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.type = type;
        this.priority = priority;
        this.code = code;
        this.message = message;
        this.recommendation = recommendation;
        this.timestamp = timestamp;
        this.resolved = resolved;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getZoneId() { return zoneId; }
    public void setZoneId(String zoneId) { this.zoneId = zoneId; }

    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }
}
