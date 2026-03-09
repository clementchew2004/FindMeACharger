set "PGPASSWORD=unchanged"
@echo off
if "%PGPASSWORD%"=="unchanged" (
    echo Please change the password in this file before running it!
    echo You might also need to change the username and database name if they are different for your setup.
    exit /b 1
)
@echo on
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./sample_data/populate_bay_types.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./sample_data/populate_report_types.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./sample_data/populate_charging_point_uni.sql
psql -U postgres -d charging_point_database -h localhost -p 5432 -q -f ./sample_data/populate_user_customer_mo.sql
