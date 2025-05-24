package com.example.be.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "vehicle_details")
public class Vehicle {
  
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String make;

  @Column(nullable = false)
  private String model;

  @Column(name = "year_of_manufacture")
  private Integer year;

  @Column(name = "color")
  private String color;

  public Vehicle() {}
  
  public Vehicle(String make, String model, Integer year, String color) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.color = color;
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getMake() { return make; }
  public void setMake(String make) { this.make = make; }

  public String getModel() { return model; }
  public void setModel(String model) { this.model = model; }

  public Integer getYear() { return year; }
  public void setYear(Integer year) { this.year = year; }

  public String getColor() { return color; }
  public void setColor(String color) { this.color = color; }
} 