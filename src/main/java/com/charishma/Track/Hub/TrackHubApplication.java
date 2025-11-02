package com.charishma.Track.Hub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync; 

@SpringBootApplication
@EnableAsync
public class TrackHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrackHubApplication.class, args);
    }
}
