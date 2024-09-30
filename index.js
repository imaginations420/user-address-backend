const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, 'userAddressApp.db');
let db = null;


const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    

    await createTables();
    
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};


const createTables = async () => {
  try {
    
    const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `;

    const createAddressTableQuery = `
      CREATE TABLE IF NOT EXISTS Address (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        address TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );
    `;

    
    await db.run(createUserTableQuery);
    await db.run(createAddressTableQuery);

    console.log('Tables created successfully!');
  } catch (e) {
    console.log(`Error creating tables: ${e.message}`);
  }
};


app.post('/register', async (req, res) => {
  const { name, address } = req.body;

  try {
    
    const insertUserQuery = `
      INSERT INTO User (name)
      VALUES ('${name}');
    `;
    const result = await db.run(insertUserQuery);
    const userId = result.lastID;

    
    const insertAddressQuery = `
      INSERT INTO Address (userId, address)
      VALUES (${userId}, '${address}');
    `;
    await db.run(insertAddressQuery);

    res.status(200).send('User and Address successfully registered!');
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
});


app.get('/users', async (req, res) => {
  try {
    const getUsersQuery = `
      SELECT User.id, User.name, Address.address
      FROM User
      JOIN Address ON User.id = Address.userId;
    `;
    const users = await db.all(getUsersQuery);
    res.send(users);
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
});


initializeDbandServer();
