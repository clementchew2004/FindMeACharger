Batch scripts replaced with cross-platform [JS script](/scripts/db/db.js)


To set up the db, copy `.env.example` to a new file called `.env` and set `DB_PASSWORD` to your postgres password

Then make sure you have Node.js and npm installed, and run `npm i` to install packages

Run these commands in order:
1. `npm run db:init` - to create the database, tables, and constraints
2. `npm run db:modify`
3. `npm run db:populate` - adds sample data to the db

After changing the db structure just re-run `npm run db:modify`