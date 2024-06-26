CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    isAdmin BOOLEAN NOT NULL
)

CREATE TABLE attendances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    attendedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)