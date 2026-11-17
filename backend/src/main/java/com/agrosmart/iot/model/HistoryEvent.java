package com.agrosmart.iot.model;

public class HistoryEvent {
    private String id;
    private String zoneId;
    private String zoneName;
    private String startTime;
    private String endTime;
    private int durationSec;
    private int initialMoisture;
    private int finalMoisture;
    private String triggerType;
    private String status;
    private double waterUsedLiters;

    public HistoryEvent() {}

    public HistoryEvent(String id, String zoneId, String zoneName, String startTime, String endTime, int durationSec,
                        int initialMoisture, int finalMoisture, String triggerType, String status, double waterUsedLiters) {
        this.id = id;
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationSec = durationSec;
        this.initialMoisture = initialMoisture;
        this.finalMoisture = finalMoisture;
        this.triggerType = triggerType;
        this.status = status;
        this.waterUsedLiters = waterUsedLiters;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getZoneId() { return zoneId; }
    public void setZoneId(String zoneId) { this.zoneId = zoneId; }

    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public int getDurationSec() { return durationSec; }
    public void setDurationSec(int durationSec) { this.durationSec = durationSec; }

    public int getInitialMoisture() { return initialMoisture; }
    public void setInitialMoisture(int initialMoisture) { this.initialMoisture = initialMoisture; }

    public int getFinalMoisture() { return finalMoisture; }
    public void setFinalMoisture(int finalMoisture) { this.finalMoisture = finalMoisture; }

    public String getTriggerType() { return triggerType; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getWaterUsedLiters() { return waterUsedLiters; }
    public void setWaterUsedLiters(double waterUsedLiters) { this.waterUsedLiters = waterUsedLiters; }
}
