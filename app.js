const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
const path = require('path');
app.use(cors());
require('dotenv').config();
// PostgreSQL RDS connection configuration
const pool = new Pool({
  user: "postgres",        // PostgreSQL username
  host: "mydb.cz0q6mq0u61d.us-east-1.rds.amazonaws.com",     // RDS PostgreSQL endpoint
  database: "mydb",       // Your database name
  password: "manoj123",     // Your database password
  port: 5432,
  ssl: {
    rejectUnauthorized: false,  // Optional: for self-signed certificates
  },                   
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Route to serve HTML file
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Create contact API
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  console.log("Request body:", req.body);
  try {
    console.log("Inserting contact info into database...");
    const queryText = "INSERT INTO contact_form(name, email, message) VALUES($1, $2, $3) RETURNING *";
    const values = [name, email, message];
    console.log("Query text:", queryText);
    const result = await pool.query(queryText, values);
    console.log("Result:", result.rows[0]);
    res.status(200).json({ message: "Contact info submitted", data: result.rows[0] });
  } catch (err) {
    console.error("Error inserting contact info:", err);
    res.status(500).json({ error: "Database error" });
  }
});
// New GET route to fetch all data
app.get('/get-all-data', async (req, res) => {
    try {
      const allData = await pool.query('SELECT * FROM contact_form');
      res.json(allData.rows); // Returns all rows from the contact_form table
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
// Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} :  http://localhost:${PORT}`);
});
