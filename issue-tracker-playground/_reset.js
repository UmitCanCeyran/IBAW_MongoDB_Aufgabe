/**
 * _reset.js — Putzt die ganze Spielwiese-DB
 *
 * Wann brauche ich das?
 *   Standardmaessig putzt jedes Skript am Anfang seine eigene Collection.
 *   Wenn ich aber einen kompletten Reset will, oder ein Skript mittendrin
 *   abgebrochen ist, fuehre ich das hier aus.
 *
 * Run:  node _reset.js
 */

const mongoose = require('mongoose');
const { connect, disconnect, log } = require('./_shared');

async function main() {
  await connect();

  const collections = await mongoose.connection.db.listCollections().toArray();
  if (collections.length === 0) {
    log('DB ist bereits leer — nichts zu tun.');
  } else {
    log(`Gefunden: ${collections.map((c) => c.name).join(', ')}`);
    for (const { name } of collections) {
      try {
        await mongoose.connection.db.collection(name).drop();
        log(`✓ ${name} gedroppt (inkl. aller Indizes)`);
      } catch (err) {
        if (err.code !== 26) throw err; // 26 = NamespaceNotFound, schon weg
      }
    }
  }

  await disconnect();
  console.log('\n✓ Reset durch. issuetracker_playground ist jetzt leer.\n');
}

main().catch((err) => {
  console.error('✗ Fehler:', err);
  process.exit(1);
});
