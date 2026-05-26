/**
 * 02-crud.js — Demo zu Uebung 2 (CRUD-Operationen)
 *
 * Was ich hier zeige:
 *   $exists — Dokumente mit/ohne ein bestimmtes Feld finden,
 *   ein Filter-Objekt mit Variablen, ObjectIds und Date — kein JSON,
 *   $set vs $unset — Feld setzen, Feld komplett entfernen,
 *   createIndex({ feld: 1 }) vs ({ feld: -1 }) — die Richtung.
 *
 * Run:  node 02-crud.js
 */

const {
  connect, disconnect, step, log,
  DemoIssue, seedIssues, cleanup,
} = require('./_shared');

async function main() {
  await connect();

  step('0. Frische Spielwiese');
  await cleanup();

  step('1. Setup — 20 Demo-Issues einfuegen');
  await seedIssues(20);
  log('→ Etwa die Haelfte hat ein notes-Feld (i % 2 === 0)');

  step('2. $exists — alle Issues MIT notes');
  const withNotes = await DemoIssue.countDocuments({ notes: { $exists: true } });
  const withoutNotes = await DemoIssue.countDocuments({ notes: { $exists: false } });
  log(`mit notes: ${withNotes}`);
  log(`ohne notes: ${withoutNotes}`);
  log(`gesamt: ${withNotes + withoutNotes} (sollte 20 sein)`);
  log('→ $exists prueft, ob das Feld vorhanden ist — nicht ob es null ist');

  step('3. Filter ist kein JSON — Variablen, ObjectId, Date funktionieren');
  const someIssue = await DemoIssue.findOne();
  const ids = [someIssue._id]; // echte ObjectId, kein String
  const filter = {
    _id: { $in: ids },                 // Variable als Wert
    created: { $lte: new Date() },     // Date-Objekt
    status: 'New',                     // unquotierter Key
  };
  const result = await DemoIssue.find(filter).limit(1);
  log(`Filter mit ObjectId + Date + Konstante: ${result.length} Treffer`);
  log('→ Waere der Filter JSON, muesste ich alles als String serialisieren');

  step('4. $set — Feld setzen oder aendern');
  const target = await DemoIssue.findOne({ notes: { $exists: true } });
  log(`Vorher: ${target.title} hat notes "${target.notes}"`);
  await DemoIssue.updateOne({ _id: target._id }, { $set: { notes: 'Neue Notiz' } });
  const afterSet = await DemoIssue.findById(target._id);
  log(`Nachher: notes = "${afterSet.notes}"`);
  log('→ $set setzt oder ueberschreibt — das Feld bleibt im Dokument');

  step('5. $unset — Feld komplett entfernen');
  log(`Vorher: notes vorhanden? ${'notes' in afterSet.toObject()}`);
  await DemoIssue.updateOne({ _id: target._id }, { $unset: { notes: '' } });
  const afterUnset = await DemoIssue.findById(target._id).lean();
  log(`Nachher: notes vorhanden? ${'notes' in afterUnset}`);
  log(`afterUnset.notes: ${afterUnset.notes}`);  // undefined, nicht null
  log('→ $unset = Feld weg. Anders als auf null setzen, da waere das Feld noch da.');

  step('6. Indexe mit Richtung (1 = aufsteigend, -1 = absteigend)');
  const collection = DemoIssue.collection;
  try { await collection.dropIndex('effort_1'); } catch {}
  await collection.createIndex({ effort: 1 });
  log('Index { effort: 1 } erstellt — aufsteigend, "Telefonbuch A nach Z"');
  const indexes = await collection.indexes();
  log('Aktuelle Indexes:');
  indexes.forEach((idx) => log(`  ${idx.name} → ${JSON.stringify(idx.key)}`));
  log('→ Bei Single-Field egal, bei Compound muss die Richtung zur Sort-Order passen');

  await disconnect();
  console.log('\n✓ Uebung 2 durch. Ein Issue ohne notes (dank $unset) + effort_1-Index in der DB.');
  console.log('  Naechster Run startet automatisch frisch.\n');
}

main().catch((err) => {
  console.error('✗ Fehler:', err);
  process.exit(1);
});
