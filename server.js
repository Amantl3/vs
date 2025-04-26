const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // ✅ important for Render

// Middleware
app.use(bodyParser.json());

// ✅ Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// SQLite database
const db = new sqlite3.Database('./votes.db');

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS votes (
    username TEXT PRIMARY KEY,
    password TEXT,
    party TEXT
  )
`);

// Handle vote submissions
app.post('/api/vote', (req, res) => {
  const { username, password, party } = req.body;

  if (!username || !password || !party) {
    return res.json({ success: false, message: 'Missing fields.' });
  }

  db.get('SELECT * FROM votes WHERE username = ?', [username], (err, row) => {
    if (err) return res.json({ success: false, message: 'Server error.' });
    if (row) return res.json({ success: false, message: 'You have already voted.' });

    db.run(
      'INSERT INTO votes (username, password, party) VALUES (?, ?, ?)',
      [username, password, party],
      (err) => {
        if (err) return res.json({ success: false, message: 'Vote failed.' });
        return res.json({ success: true });
      }
    );
  });
});

// ✅ Catch-all to serve index.html by default (for root URL)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
