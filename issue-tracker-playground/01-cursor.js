/**
 * 01-cursor.js — Demo zu Uebung 1 (Cursor-Methoden)
 *
 * Was ich hier zeige:
 *   wie ein einfacher .find() ein Array zurueckgibt (Cursor versteckt),
 *   .sort() + .limit() + .skip() als Pagination-Kette,
 *   .select() fuer Projektion,
 *   .lean() vs nicht-lean() im direkten Vergleich,
 *   .cursor() — der echte explizite Cursor mit for-await-of,
 *   .countDocuments() fuer das Total.
 *
 * Run:  node 01-cursor.js
 */

const {
  connect, disconnect, step, log, pretty,
  DemoIssue, seedIssues, cleanup,
} = require('./_shared');

async function main() {
  await connect();

  step('0. Frische Spielwiese — alte Daten weg, falls noch da');
  await cleanup();

  step('1. Setup — 20 Demo-Issues einfuegen');
  await seedIssues(20);

  step('2. Einfacher .find() — Cursor wird sofort zum Array');
  const all = await DemoIssue.find();
  log(`Gefunden: ${all.length} Dokumente`);
  log(`Typ von "all": ${Array.isArray(all) ? 'Array' : typeof all}`);
  log('→ Den Cursor sehe ich nirgends — Mongoose gibt gleich das Array');

  step('3. .sort() — nach effort aufsteigend, die 3 kleinsten');
  const sorted = await DemoIssue.find().sort({ effort: 1 }).limit(3);
  sorted.forEach((i) => log(`${i.title}, effort ${i.effort}`));

  step('4. Pagination mit .skip() + .limit()');
  const limit = 5;
  for (let page = 1; page <= 3; page++) {
    const docs = await DemoIssue.find()
      .sort({ id: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    log(`Seite ${page}: ${docs.map((d) => d.title).join(', ')}`);
  }
  log('→ skip(0).limit(5), skip(5).limit(5), skip(10).limit(5) — klassische Pagination');

  step('5. .select() — nur ein paar Felder zurueckgeben');
  const slim = await DemoIssue.find().select('title status').limit(3);
  console.log(pretty(slim.map((d) => d.toObject())));
  log('→ Nur title + status + _id (das _id kommt automatisch mit)');

  step('6. .lean() — Plain Objects statt Mongoose-Documents');
  const fancyDoc = await DemoIssue.findOne();
  const leanDoc = await DemoIssue.findOne().lean();
  log(`fancy hat .save(): ${typeof fancyDoc.save === 'function'}`);
  log(`lean  hat .save(): ${typeof leanDoc.save === 'function'}`);
  log('→ lean = nur Daten, schneller. fancy = Daten + Methoden.');

  step('7. .cursor() — der echte explizite Cursor');
  log('Iteriere mit for-await-of durch alle "New"-Issues:');
  let count = 0;
  const cursor = DemoIssue.find({ status: 'New' }).cursor();
  for await (const issue of cursor) {
    if (count < 3) log(`  → ${issue.title} (${issue.status})`);
    count++;
  }
  log(`Gesamt iteriert: ${count} Dokumente`);
  log('→ Anders als toArray() lebt nur EIN Dokument gleichzeitig im RAM');

  step('8. .countDocuments() — wie viele matchen den Filter?');
  const totalNew = await DemoIssue.countDocuments({ status: 'New' });
  const totalAll = await DemoIssue.countDocuments();
  log(`status=New: ${totalNew} / ${totalAll}`);

  await disconnect();
  console.log('\n✓ Uebung 1 durch. demo_issues liegen in issuetracker_playground.');
  console.log('  In Compass/Atlas anschauen. Naechster Run startet automatisch frisch.\n');
}

main().catch((err) => {
  console.error('✗ Fehler:', err);
  process.exit(1);
});
