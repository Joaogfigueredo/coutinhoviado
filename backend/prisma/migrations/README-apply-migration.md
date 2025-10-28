Before running the migration:

1) Check if the `currency` column already exists:

   # using mysql CLI
   mysql -u <user> -p -e "USE <db>; SHOW COLUMNS FROM Account LIKE 'currency';"

   # or with environment DATABASE_URL set, via node/mysql client

If the column does not exist, apply the migration:

  cd backend
  npx prisma migrate deploy

Or (dev flow):

  cd backend
  npx prisma migrate dev --name add_account_currency

If you prefer to run a single SQL statement instead of the Prisma migration, run the SQL in `migration.sql` located in this folder.

Note: ensure you have backup before applying migrations in production.