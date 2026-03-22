-- Populate accessibility data for charging bays (feature f9)

-- Bay 1
UPDATE charging_bays 
SET 
	wheelchair_accessible = TRUE,
	accessibility_notes = 'Step-free access',
    blocked_socket = FALSE
WHERE charging_bay_id = 1; 

-- Bay 2
UPDATE charging_bays 
SET 
	wheelchair_accessible = TRUE, 
	accessibility_notes = 'Cable blocked by furniture',
	blocked_socket = TRUE
WHERE charging_bay_id = 2; 

-- Bay 3
UPDATE charging_bays 
SET
	wheelchair_accessible = TRUE,
	accessibility_notes = 'Accessible bay but limited lighting at night',
	blocked_socket = FALSE
WHERE charging_bay_id = 3;	
