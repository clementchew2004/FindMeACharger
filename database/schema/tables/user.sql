CREATE TABLE IF NOT EXISTS "user" (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    public_name VARCHAR(255),
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- quotes needed around camelCase column names
-- user is a reserved keyword so it also needs quotes
-- BetterAuth expects these specific table/column names