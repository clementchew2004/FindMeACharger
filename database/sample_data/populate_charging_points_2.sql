INSERT INTO charging_points
    (owner_id, charging_point_location, latitude, longitude, shorthand_name)
VALUES
    (
        (SELECT organisation_id FROM organisations WHERE organisation_name = 'Supaspeed123 Ltd.'),
        'Birmingham New Street station, Station Street, Birmingham, West Midlands, B2 4QA',
        52.4778442,
        -1.8989888,
        'BIR-NEWSTREET'
    ),
    (
        (SELECT organisation_id FROM organisations WHERE organisation_name = 'Supaspeed123 Ltd.'),
        'Truro station, Station Road, Truro, Cornwall, TR1 3HH',
        50.26562599918419,
        -5.0504225308386115,
        'TRURO-STATION'
    ),
    (
        (SELECT organisation_id FROM organisations WHERE organisation_name = 'Supaspeed123 Ltd.'),
        'Black Country Living Museum, Discovery Wy, Dudley DY1 4AL',
        52.51809926127778,
        -2.074768085527758,
        'DUDLEY-BCLM'
    ),
    (
        (SELECT organisation_id FROM organisations WHERE organisation_name = 'Supaspeed123 Ltd.'),
        'St. Paul''s Churchyard, London EC4M 8AD',
        51.5140768,
        -0.0995336,
        'LDN-STPAULS'
    );

INSERT INTO localised_charging_point_descriptions 
    (charging_point_id, locale_id, charging_point_description) 
VALUES
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'BIR-NEWSTREET'),
        (SELECT locale_id FROM locales WHERE country_code = 'UK'),
        'Perfect for commuters and travellers, this charging point is located on the first floor of New Street Station!'
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'TRURO-STATION'),
        (SELECT locale_id FROM locales WHERE country_code = 'UK'),
        'Located in Truro, Cornwall''s only city, this charging point will be perfect for tourists low on juice!'
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'DUDLEY-BCLM'),
        (SELECT locale_id FROM locales WHERE country_code = 'UK'),
        'Located conveniently within the Black Country Living Museum, so you may charge your devices whilst you explore the rich history and culture of the Black Country.'
    ),
    (
        (SELECT charging_point_id FROM charging_points WHERE shorthand_name = 'LDN-STPAULS'),
        (SELECT locale_id FROM locales WHERE country_code = 'UK'),
        'A charging point located just outside of St. Paul''s Cathedral.'
    );
    
