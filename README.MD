# FindMeACharger - ObjectOrientedOracles Group Project

## Setup
### Express backend
1. Make sure Node.js and Postgres are installed
2. In root directory, install packages: `npm i`
3. Create a new Postgres database
4. Copy [.env.example](.env.example) to [.env](.env) and edit env variables. Follow instructions in the file to create API keys or secrets, or use the sample values provided below

#### Auth
- Set `BETTER_AUTH_SECRET` in [.env](.env)
- For example, `gh5I5dFhooU3CJKT0NRYRsZgkAaiKHkf` could be used as a suitable value for testing, or you can generate your own using [Better Auth's generator](https://better-auth.com/docs/installation#set-environment-variables)

#### Routing
- Set `ORS_API_KEY` - you can create one on the [HeiGIT website](https://account.heigit.org/manage/key)
- If you don't want to create an API key, please feel free to use this one: `eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE1OTI0YjlmOTJkODQyOTJiMzg3ZDM4NWRkZDgxM2FhIiwiaCI6Im11cm11cjY0In0=`, which has a limit of 2000 routing requests / day.

#### Database
1. Set `DB_PASSWORD` and make sure the other env options match the database you created
2. Apply schemas: `npm run db:init`
3. Apply modifications: `npm run db:modify`
4. Populate with sample data: `npm run db:populate`

### React (Vite) frontend
1. `cd client`
2. `npm i`
3. Copy [.env.example](client/.env.example) to [.env](client/.env)

## Running 
### Backend
1. `npm run dev`

### Frontend
1. `cd client`
2. `npm run dev`

## Tests
### Backend Tests
1. Set up and populate the DB, as described above
2. Make sure the backend is running!
3. `npm test`

### Frontend Integration Tests
1. `cd client`
2. `npm test`

## Login Details for Mock Users
### Operator
1. email: operator@test.com
2. password: password1234
### Customer
1. email: customer@test.com
2. password: password1234