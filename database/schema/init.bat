set "PGPASSWORD=unchanged"
@echo off
if "%PGPASSWORD%"=="unchanged" (
    echo Please change the password in this file before running it!
    echo You might also need to change the username and database name if they are different for your setup.
    exit /b 1
)
@echo on
psql -U postgres -d postgres -h localhost -p 5432 -q -f ./tables/create_database.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/users.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/auth_tables.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/customers.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/moderators.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/operators.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/organisations.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/opening_times.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/charging_points.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/charging_bays.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/bookings.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/bay_types.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/report_types.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/reports.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./tables/foreign_keys.sql
