# FindMeACharger

## Setup
1. Make sure Node.js is installed
2. Install packages: `npm i`
3. Copy `.env.example` to `.env` and edit env variables

### Auth
- Set `BETTER_AUTH_SECRET` in `.env`

### Database
- Set `DB_PASSWORD` in `.env`
- Create schema: `npm run db:init`
- Apply modifications: `npm run db:modify`
- Populate sample data: `npm run db:populate`