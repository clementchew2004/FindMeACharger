INSERT INTO languages (language_code, language_name) VALUES
    ('en', 'English');

INSERT INTO locales (language_id, country_code, country_name) VALUES
    (
        (SELECT language_id FROM languages WHERE language_code = 'en'),
        'UK',
        'United Kingdom'
    );