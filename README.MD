# FindMeACharger

## Setup
1. Make sure Node.js is installed
2. Install packages: `npm i`
3. Copy [.env.example](.env.example) to [.env](.env) and edit env variables

### Run Express API
- For development: `npm run dev`
- Build for production: `npm run build`
- Run production build: `npm run start`

### Auth
- Set `RESEND_API_KEY` and `BETTER_AUTH_SECRET` in [.env](.env)

### Database
- Set `DB_PASSWORD` in `.env`
- Create schema: `npm run db:init`
- Apply modifications: `npm run db:modify`
- Populate sample data: `npm run db:populate`

### React frontend (Vite + TypeScript)
1. `cd client`
2. `npm i`
3. `npm run dev`

## Notes
For the client please read [https://better-auth.com/docs/installation#create-client-instance](BetterAuth docs)

snippet for re-verifying email after failed login:
```
const { data, error } = await authClient.signIn.email({
    email: "user@example.com",
    password: "password123",
});

if (error?.status === 403) {
    alert("Please verify your email before logging in.");
}
```