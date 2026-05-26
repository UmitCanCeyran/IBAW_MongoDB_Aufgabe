require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const issueRoutes = require('./routes/issueRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Body-Parser: erlaubt JSON im Request-Body (fuer POST/PUT)
app.use(express.json());

// Health-Check / Begruessung auf der Wurzel
app.get('/', (req, res) => {
  res.json({ message: 'Issue Tracker API v1.0 - laeuft.' });
});

// Alle Issue-Routen unter /api/issues
app.use('/api/issues', issueRoutes);

/**
 * Reihenfolge wie im Buch (Kapitel 6, "Reading from MongoDB"):
 * Erst die DB-Verbindung aufbauen, ERST DANN den Server starten.
 * So nimmt der Server keinen Traffic an, solange die DB nicht steht.
 */
(async function () {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server laeuft auf Port ${PORT}`);
  });
})();
