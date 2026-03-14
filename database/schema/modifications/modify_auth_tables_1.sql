ALTER TABLE account
    ADD UNIQUE ("accountId", "providerId");