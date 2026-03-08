ALTER TABLE charging_bays
    ADD FOREIGN KEY (charging_point_id) REFERENCES charging_points(charging_point_id);
ALTER TABLE charging_bays
    ADD FOREIGN KEY (bay_type) REFERENCES bay_types(bay_type_id);
ALTER TABLE moderators 
    ADD FOREIGN KEY (user_id) REFERENCES users(user_id);
ALTER TABLE bookings
    ADD FOREIGN KEY (customer_id) REFERENCES customers(customer_id);
ALTER TABLE bookings
    ADD FOREIGN KEY (charging_bay_id) REFERENCES charging_bays(charging_bay_id);
ALTER TABLE operators
    ADD FOREIGN KEY (user_id) REFERENCES users(user_id);
ALTER TABLE operators
    ADD FOREIGN KEY (organisation_id) REFERENCES organisations(organisation_id);
ALTER TABLE organisations
    ADD FOREIGN KEY (organisation_owner_id) REFERENCES operators(operator_id);
ALTER TABLE reports
    ADD FOREIGN KEY (reporter_id) REFERENCES customers(customer_id);
ALTER TABLE reports
    ADD FOREIGN KEY (charging_point_id) REFERENCES charging_points(charging_point_id);
ALTER TABLE reports
    ADD FOREIGN KEY (report_reason) REFERENCES report_types(report_type_id);
ALTER TABLE reports
    ADD FOREIGN KEY (booking_id) REFERENCES bookings(booking_id);
ALTER TABLE charging_points
    ADD FOREIGN KEY (owner_id) REFERENCES organisations(organisation_id);
ALTER TABLE customers
    ADD FOREIGN KEY (user_id) REFERENCES users(user_id);