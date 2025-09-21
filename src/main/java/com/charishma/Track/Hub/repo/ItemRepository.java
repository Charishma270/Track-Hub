package com.charishma.Track.Hub.repo;

import com.charishma.Track.Hub.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}

