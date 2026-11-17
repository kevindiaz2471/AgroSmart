package com.agrosmart.iot.model;

public class Place {
    private String id;
    private String userId;
    private String name;
    private String location;
    private String coords;
    private String description;

    public Place() {}

    public Place(String id, String userId, String name, String location, String coords, String description) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.location = location;
        this.coords = coords;
        this.description = description;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCoords() { return coords; }
    public void setCoords(String coords) { this.coords = coords; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
