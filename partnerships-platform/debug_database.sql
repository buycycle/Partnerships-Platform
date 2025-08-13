-- Debug queries to check database and table existence

-- 1. Show all databases
SHOW DATABASES;

-- 2. Check current database
SELECT DATABASE();

-- 3. Find the table in any database
SELECT TABLE_SCHEMA, TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'partnerships_everide_users';

-- 4. Show tables in buycycle database
USE buycycle;
SHOW TABLES LIKE '%partnerships%';

-- 5. If table is in different database, check other common names
SHOW TABLES FROM buycycle LIKE '%partnerships%';
SHOW TABLES FROM partnerships LIKE '%partnerships%';
SHOW TABLES FROM everide LIKE '%partnerships%';

