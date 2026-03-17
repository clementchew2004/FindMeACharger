CREATE TABLE IF NOT EXISTS languages (
    language_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    language_code VARCHAR(3) NOT NULL UNIQUE,
    language_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS locales (
    locale_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    language_id INT NOT NULL,
    country_code VARCHAR(3) NOT NULL UNIQUE,
    country_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS localised_charging_point_descriptions (
    localised_description_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    charging_point_id INT NOT NULL,
    locale_id INT NOT NULL,
    charging_point_description VARCHAR(255) NOT NULL,
    UNIQUE (charging_point_id, locale_id)
);