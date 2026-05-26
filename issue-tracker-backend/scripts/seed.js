require('dotenv').config();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Counter = require('../models/Counter');

/**
 * Seed-Skript - das Node.js/Mongoose-Pendant zu init.mongo.js aus dem Buch
 * (Listing 6-6). Loescht bestehende Issues, legt zwei Beispiele an und
 * setzt den Counter passend, damit das naechste per API erzeugte Issue
 * die id 3 bekommt.
 *
 * Run:  npm run seed
 */
const sampleIssues = [
  {
    id: 1, status: 'New', owner: 'Ravan', effort: 5,
    created: new Date('2026-01-15'),
    title: 'Fehler in der Konsole beim Klick auf Add',
  },
  {
    id: 2, status: 'Assigned', owner: 'Eddie', effort: 14,
    created: new Date('2026-01-16'), due: new Date('2026-02-01'),
    title: 'Unterer Rand des Panels fehlt',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Verbunden mit Atlas.');

    await Issue.deleteMany({});
    await Issue.insertMany(sampleIssues);
    console.log(`${sampleIssues.length} Issues eingefuegt.`);

    // Counter auf die Anzahl setzen -> naechste id wird 3
    await Counter.findOneAndUpdate(
      { _id: 'issues' },
      { $set: { current: sampleIssues.length } },
      { upsert: true }
    );
    console.log(`Counter "issues" auf ${sampleIssues.length} gesetzt.`);

    console.log('Seed fertig.');
  } catch (err) {
    console.error('Seed-Fehler:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
