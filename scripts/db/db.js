const fs = require('node:fs/promises');
const path = require('node:path');

require('dotenv').config();

const Pg = require('pg');
const { Client } = Pg;

function getEnv(name, fallback) {
  const value = process.env[name];
  return value == null || value === '' ? fallback : value;
}

function getEnvAny(names, fallback) {
  for (const name of names) {
    const value = process.env[name];
    if (value != null && value !== '') return value;
  }
  return fallback;
}

function getRootDir() {
  return path.resolve(__dirname, '..', '..');
}

function resolveFromRoot(...segments) {
  return path.join(getRootDir(), ...segments);
}

function getConnectionConfig(database) {
  const password = getEnvAny(['PGPASSWORD', 'DB_PASSWORD'], null);
  if (password == null) {
    throw new Error('Missing required env var: set DB_PASSWORD (preferred) or PGPASSWORD');
  }

  return {
    host: getEnvAny(['PGHOST', 'DB_HOST'], 'localhost'),
    port: Number(getEnvAny(['PGPORT', 'DB_PORT'], '5432')),
    user: getEnvAny(['PGUSER', 'DB_USER'], 'postgres'),
    password,
    database,
  };
}

async function runSqlFile(client, filePath) {
  const label = path.relative(getRootDir(), filePath);
  console.log(`\n==> Running ${label}`);

  const sql = await fs.readFile(filePath, 'utf8');
  const trimmed = sql.trim();
  if (!trimmed) {
    console.log('    (skipped empty file)');
    return;
  }

  await client.query(sql);
  console.log('    OK');
}

function isDuplicateDatabaseError(error) {
  // Postgres: duplicate_database
  return error && (error.code === '42P04' || /duplicate database/i.test(String(error.message)));
}

async function runSqlFiles({ database, files }) {
  const client = new Client(getConnectionConfig(database));
  await client.connect();

  try {
    for (const file of files) {
      try {
        await runSqlFile(client, file);
      }
      catch (error) {
        console.error("ERROR: Failed to execute sql file: ", file, "\n error was: ", error);
      }
    }
  } finally {
    await client.end();
  }
}

function getFileLists() {
  return {
    init: {
      adminDb: getEnv('PGADMIN_DB', 'postgres'),
      appDb: getEnvAny(['PGDATABASE', 'DB_NAME'], 'charging_point_database'),
      adminFiles: [resolveFromRoot('database', 'schema', 'tables', 'create_database.sql')],
      appFiles: [
        resolveFromRoot('database', 'schema', 'tables', 'user.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'auth_tables.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'customers.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'moderators.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'operators.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'organisations.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'opening_times.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'locales.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'charging_points.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'charging_bays.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'bookings.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'bay_types.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'report_types.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'reports.sql'),
        resolveFromRoot('database', 'schema', 'tables', 'foreign_keys.sql'),
      ],
    },

    modify: {
      appDb: getEnvAny(['PGDATABASE', 'DB_NAME'], 'charging_point_database'),
      appFiles: [
        resolveFromRoot('database', 'schema', 'modifications', 'modify_charging_points_1.sql'),
        resolveFromRoot('database', 'schema', 'modifications', 'modify_opening_times_1.sql'),
        resolveFromRoot('database', 'schema', 'modifications', 'modify_customers_1.sql'),
        resolveFromRoot('database', 'schema', 'modifications', 'modify_auth_tables_1.sql'),
        resolveFromRoot('database', 'schema', 'modifications', 'modify_charging_points_2.sql'),
      ],
    },

    populate: {
      appDb: getEnvAny(['PGDATABASE', 'DB_NAME'], 'charging_point_database'),
      appFiles: [
        resolveFromRoot('database', 'sample_data', 'populate_bay_types.sql'),
        resolveFromRoot('database', 'sample_data', 'populate_report_types.sql'),
        resolveFromRoot('database', 'sample_data', 'populate_locales_english_uk.sql'),
        resolveFromRoot('database', 'sample_data', 'populate_charging_point_uni.sql'),
        resolveFromRoot('database', 'sample_data', 'populate_user_customer_mo.sql'),
      ],
    },
  };
}

async function main() {
  const command = process.argv[2];
  const lists = getFileLists();

  if (!command || !['init', 'modify', 'populate'].includes(command)) {
    console.log('Usage: node scripts/db/db.js <init|modify|populate>');
    process.exit(command ? 1 : 0);
  }

  if (command === 'init') {
    const { adminDb, appDb, adminFiles, appFiles } = lists.init;

    try {
      await runSqlFiles({ database: adminDb, files: adminFiles });
    } catch (error) {
      if (isDuplicateDatabaseError(error)) {
        console.warn(`\nWARN: Database already exists; continuing.`);
      } 
      else {
        throw error;
      }
    }

    try {
      await runSqlFiles({ database: appDb, files: appFiles });
    }
    catch (error) {
      throw error;
    }
    
    return;
  }

  if (command === 'modify') {
    const { appDb, appFiles } = lists.modify;
    await runSqlFiles({ database: appDb, files: appFiles });
    return;
  }

  if (command === 'populate') {
    const { appDb, appFiles } = lists.populate;
    await runSqlFiles({ database: appDb, files: appFiles });
  }
}

main().catch((error) => {
  console.error('\nDB script failed:');
  console.error(error);
  process.exit(1);
});
