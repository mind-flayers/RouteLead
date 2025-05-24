CREATE TABLE IF NOT EXISTS vehicle_details (
    id BIGSERIAL PRIMARY KEY,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year INTEGER,
    color VARCHAR(255)
); 