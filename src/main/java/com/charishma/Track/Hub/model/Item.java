package com.charishma.Track.Hub.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String category; // e.g., "electronics", "clothing"
    private String status;   // "lost" or "found"
    private String location;
    private String date;
    private String poster;   // person who posted
    private String imageUrl; // uploaded image URL
}

