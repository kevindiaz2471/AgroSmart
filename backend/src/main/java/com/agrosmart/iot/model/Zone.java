package com.agrosmart.iot.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Zone {
    private String id;
    private String placeId;
    private String name;
    private String cropType;
    private String mode; // AUTO, MANUAL, SCHEDULED
    private int minMoisture;
    private int maxMoisture;
    private int maxDurationMin;
    private int intervalSec;
    private int cooldownSec = 30;
    private double flowRateLpm = 12.0;
    private int currentMoisture;
    private boolean pumpState;
    private boolean tankOk;
    private boolean sensorOk;
    private Long pumpStartTime;
    private String pumpStartTimeFormatted;
    private Integer pumpStartMoisture;
    private String activeTriggerType;
    private Integer plannedDurationMin;
    private Long lastPumpStopTime;
    private String lastTelemetryTime;
    private List<Schedule> schedules = new ArrayList<>();
    private List<Map<String, Object>> moistureHistory = new ArrayList<>();

    public Zone() {}

    public Zone(String id, String placeId, String name, String cropType, String mode,
                int minMoisture, int maxMoisture, int maxDurationMin, int intervalSec,
                int currentMoisture, boolean pumpState, boolean tankOk, boolean sensorOk) {
        this.id = id;
        this.placeId = placeId;
        this.name = name;
        this.cropType = cropType;
        this.mode = mode;
        this.minMoisture = minMoisture;
        this.maxMoisture = maxMoisture;
        this.maxDurationMin = maxDurationMin;
        this.intervalSec = intervalSec;
        this.cooldownSec = 30;
        this.flowRateLpm = 12.0;
        this.currentMoisture = currentMoisture;
        this.pumpState = pumpState;
        this.tankOk = tankOk;
        this.sensorOk = sensorOk;
        this.pumpStartTime = null;
        this.pumpStartTimeFormatted = null;
        this.pumpStartMoisture = null;
        this.activeTriggerType = null;
        this.plannedDurationMin = null;
        this.lastPumpStopTime = null;
        this.lastTelemetryTime = null;
        this.schedules = new ArrayList<>();
        this.moistureHistory = new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPlaceId() { return placeId; }
    public void setPlaceId(String placeId) { this.placeId = placeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCropType() { return cropType; }
    public void setCropType(String cropType) { this.cropType = cropType; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public int getMinMoisture() { return minMoisture; }
    public void setMinMoisture(int minMoisture) { this.minMoisture = minMoisture; }

    public int getMaxMoisture() { return maxMoisture; }
    public void setMaxMoisture(int maxMoisture) { this.maxMoisture = maxMoisture; }

    public int getMaxDurationMin() { return maxDurationMin; }
    public void setMaxDurationMin(int maxDurationMin) { this.maxDurationMin = maxDurationMin; }

    public int getIntervalSec() { return intervalSec; }
    public void setIntervalSec(int intervalSec) { this.intervalSec = intervalSec; }

    public int getCooldownSec() { return cooldownSec; }
    public void setCooldownSec(int cooldownSec) { this.cooldownSec = cooldownSec; }

    public double getFlowRateLpm() { return flowRateLpm; }
    public void setFlowRateLpm(double flowRateLpm) { this.flowRateLpm = flowRateLpm; }

    public int getCurrentMoisture() { return currentMoisture; }
    public void setCurrentMoisture(int currentMoisture) { this.currentMoisture = currentMoisture; }

    public boolean isPumpState() { return pumpState; }
    public void setPumpState(boolean pumpState) { this.pumpState = pumpState; }

    public boolean isTankOk() { return tankOk; }
    public void setTankOk(boolean tankOk) { this.tankOk = tankOk; }

    public boolean isSensorOk() { return sensorOk; }
    public void setSensorOk(boolean sensorOk) { this.sensorOk = sensorOk; }

    public Long getPumpStartTime() { return pumpStartTime; }
    public void setPumpStartTime(Long pumpStartTime) { this.pumpStartTime = pumpStartTime; }

    public String getPumpStartTimeFormatted() { return pumpStartTimeFormatted; }
    public void setPumpStartTimeFormatted(String pumpStartTimeFormatted) { this.pumpStartTimeFormatted = pumpStartTimeFormatted; }

    public Integer getPumpStartMoisture() { return pumpStartMoisture; }
    public void setPumpStartMoisture(Integer pumpStartMoisture) { this.pumpStartMoisture = pumpStartMoisture; }

    public String getActiveTriggerType() { return activeTriggerType; }
    public void setActiveTriggerType(String activeTriggerType) { this.activeTriggerType = activeTriggerType; }

    public Integer getPlannedDurationMin() { return plannedDurationMin; }
    public void setPlannedDurationMin(Integer plannedDurationMin) { this.plannedDurationMin = plannedDurationMin; }

    public Long getLastPumpStopTime() { return lastPumpStopTime; }
    public void setLastPumpStopTime(Long lastPumpStopTime) { this.lastPumpStopTime = lastPumpStopTime; }

    public String getLastTelemetryTime() { return lastTelemetryTime; }
    public void setLastTelemetryTime(String lastTelemetryTime) { this.lastTelemetryTime = lastTelemetryTime; }

    public List<Schedule> getSchedules() { return schedules; }
    public void setSchedules(List<Schedule> schedules) { this.schedules = schedules; }

    public List<Map<String, Object>> getMoistureHistory() { return moistureHistory; }
    public void setMoistureHistory(List<Map<String, Object>> moistureHistory) { this.moistureHistory = moistureHistory; }
}
