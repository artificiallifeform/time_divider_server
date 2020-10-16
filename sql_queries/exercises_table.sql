CREATE TABLE exercises(
	id INT auto_increment primary key,
    user_id INT,
    date TIMESTAMP NOT NULL,
    title VARCHAR(255),
    seconds INT,
    last_update TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);