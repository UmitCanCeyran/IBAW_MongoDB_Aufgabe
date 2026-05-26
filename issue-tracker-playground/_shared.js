/**
 * _shared.js
 * Gemeinsame Helper fuer alle Playground-Skripte.
 *
 * Was hier drin ist:
 *   Connect/Disconnect zur Spielwiese-DB (auf MongoDB Atlas),
 *   ein huebscher Logger mit Trennlinien,
 *   ein Demo-Issue-Schema fuer die fuenf Uebungen.
 *
 * Die Verbindung kommt aus der .env (MONGODB_URI). Der DB-Name
 * `issuetracker_playground` ist fest verdrahtet, damit die Skripte
 * niemals in die echte issuetracker-DB des Backends schreiben.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Den DB-Namen aus dem Connection-String herausschneiden und durch
// die Spielwiese-DB ersetzen - so bleibt die echte DB unberuehrt.
const RAW = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'issuetracker_playground';
const URI = RAW.replace(/\/[^/?]*(\?|$)/, `/${DB_NAME}$1`);

async function connect() {
  await mongoose.connect(URI);
  log(`Verbunden mit Atlas (DB: ${DB_NAME})`);
}

async function disconnect() {
  await mongoose.disconnect();
  log('Verbindung geschlossen');
}

function step(title) {
  console.log('\n' + '─'.repeat(60));
  console.log(`▶ ${title}`);
  console.log('─'.repeat(60));
}

function log(msg) {
  console.log(`  ${msg}`);
}

function pretty(obj) {
  return JSON.stringify(obj, null, 2)
    .split('\n')
    .map((l) => '  ' + l)
    .join('\n');
}

// Demo-Issue-Schema fuer die Uebungen: ein Ticket mit ein paar Feldern,
// an denen sich die Konzepte gut zeigen lassen.
const issueSchema = new mongoose.Schema(
  {
    id: { type: Number },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['New', 'Assigned', 'Fixed', 'Closed'],
      default: 'New',
    },
    owner: { type: String },
    effort: { type: Number },
    notes: { type: String },   // optionales Feld - wird in Uebung 2 mit $unset entfernt
    created: { type: Date, default: Date.now },
  },
  { collection: 'demo_issues' }
);

const DemoIssue =
  mongoose.models.DemoIssue || mongoose.model('DemoIssue', issueSchema);

// Counter fuer das getNextSequence-Pattern (Uebung 5)
const counterSchema = new mongoose.Schema({
  _id: String,
  current: { type: Number, default: 0 },
});
const Counter =
  mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * Erzeugt Test-Issues. Etwa die Haelfte bekommt ein notes-Feld,
 * damit sich $exists schoen zeigen laesst.
 */
async function seedIssues(count = 20) {
  const owners = ['Ravan', 'Eddie', 'Miku', 'Umit'];
  const statuses = ['New', 'Assigned', 'Fixed', 'Closed'];
  const docs = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Demo-Issue ${String(i + 1).padStart(2, '0')}`,
    status: statuses[i % statuses.length],
    owner: owners[i % owners.length],
    effort: 1 + (i % 10),
    notes: i % 2 === 0 ? `Notiz zu Issue ${i + 1}` : undefined,
  }));
  await DemoIssue.insertMany(docs);
  log(`${count} Demo-Issues eingefuegt`);
}

async function cleanup() {
  await DemoIssue.deleteMany({});
  log('Aufgeraeumt - demo_issues geleert');
}

module.exports = {
  connect,
  disconnect,
  step,
  log,
  pretty,
  DemoIssue,
  Counter,
  seedIssues,
  cleanup,
  URI,
  DB_NAME,
};
