package com.charishma.Track.Hub.repo;

import com.charishma.Track.Hub.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByPostId(Long postId);
}
