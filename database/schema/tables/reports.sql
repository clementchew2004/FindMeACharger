CREATE TABLE IF NOT EXISTS reports (
    report_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reporter_id INT NOT NULL,
    charging_point_id INT NOT NULL,
    report_reason INT NOT NULL,
    report_description TEXT,
    booking_id INT -- nullable as there may not be a booking associated to a report (someone may just report an issue without it affecting them)
);