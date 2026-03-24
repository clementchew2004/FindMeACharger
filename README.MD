# FindMeACharger - ObjectOrientedOracles Group Project

## Setup
### Express backend
1. Make sure Node.js and Postgres are installed
2. In root directory, install packages: `npm i`
3. Create a new Postgres database
4. Copy [.env.example](.env.example) to [.env](.env) and edit env variables. Follow instructions in the file to create API keys or secrets

#### Auth
- Set `BETTER_AUTH_SECRET` in [.env](.env)

#### Routing
- Set `ORS_API_KEY`

#### Database
1. Set `DB_PASSWORD`
2. Create schema: `npm run db:init`
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
1. In a new terminal, `cd client`
2. `npm run dev`

#### Tests
1. Make sure the backend is running!
2. `npm test`

#### Frontend Integration Tests
1. `cd client`
2. `npm test`

#### Login Details (Operator)
1. email: operator@test.com
2. password: password1234
#### Login Details (Customer)
1. email: customer@test.com
2. password: password1234

### Running a production build locally
Environment
1. In backend [.env](.env), change `NODE_ENV` to `production`
1. Also in backend [.env](.env), change `CLIENT_ORIGIN` to `http://localhost:4173`

Backend:
1. `npm run build`
2. `npm run start`

Frontend:
1. `npm run build`
2. `npm run preview`