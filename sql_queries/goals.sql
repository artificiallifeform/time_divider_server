CREATE TABLE goals(
    id INT auto_increment primary key,
    user_id INT,
    expiration TIMESTAMP NOT NULL,
    time_spent INT,
    created_at TIMESTAMP NOT NULL,
    title VARHCHAR(255),
    goal_time INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);