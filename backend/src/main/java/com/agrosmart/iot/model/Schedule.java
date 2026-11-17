package com.agrosmart.iot.model;

public class Schedule {
    private String id;
    private String days;
    private String time;
    private int duration;
    private boolean active;
    private String lastTriggeredKey;

    public Schedule() {}

    public Schedule(String id, String days, String time, int duration, boolean active) {
        this.id = id;
        this.days = days;
        this.time = time;
        this.duration = duration;
        this.active = active;
        this.lastTriggeredKey = null;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDays() { return days; }
    public void setDays(String days) { this.days = days; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getLastTriggeredKey() { return lastTriggeredKey; }
    public void setLastTriggeredKey(String lastTriggeredKey) { this.lastTriggeredKey = lastTriggeredKey; }
}
