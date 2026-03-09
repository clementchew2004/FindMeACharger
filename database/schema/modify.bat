set "PGPASSWORD=unchanged"
@echo off
if "%PGPASSWORD%"=="unchanged" (
    echo Please change the password in this file before running it!
    echo You might also need to change the username and database name if they are different for your setup.
    exit /b 1
)
@echo on
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./modifications/modify_charging_points_1.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./modifications/modify_opening_times_1.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./modifications/modify_customers_1.sql