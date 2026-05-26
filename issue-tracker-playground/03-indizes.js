/**
 * 03-indizes.js — Demo zu Uebung 3 (Schema-Init & Indizes)
 *
 * Was ich hier zeige:
 *   wie eine Query OHNE Index aussieht (Collection Scan, COLLSCAN),
 *   wie dieselbe Query MIT Index aussieht (IXSCAN),
 *   den messbaren Unterschied bei 5'000 Dokumenten,
 *   einen Text-Index fuer eine Suchleiste (die Buch-Andeutung).
 *
 * Run:  node 03-indizes.js
 */

const { connect, disconnect, step, log, DemoIssue } = require('./_shared');

async function main() {
  await connect();

  step('0. Frische Spielwiese — Daten + Demo-Indizes weg');
  await DemoIssue.deleteMany({});
  try { await DemoIssue.collection.dropIndex('status_1'); } catch {}
  try { await DemoIssue.collection.dropIndex('title_text'); } catch {}
  log('Collection + Demo-Indizes geleert');

  step("1. Setup — 5'000 Demo-Issues einfuegen (kann ein paar Sekunden dauern)");
  const statuses = ['New', 'Assigned', 'Fixed', 'Closed'];
  const docs = Array.from({ length: 5000 }, (_, i) => ({
    id: i + 1,
    title: `Issue ${i + 1} ${['login', 'panel', 'crash', 'render'][i % 4]} bug`,
    status: statuses[i % 4],
    owner: ['Ravan', 'Eddie', 'Miku'][i % 3],
    effort: 1 + (i % 20),
  }));
  await DemoIssue.insertMany(docs);
  log("5'000 Dokumente eingefuegt");

  step('2. Query OHNE Index — wie schnell, und wie macht MongoDB das?');
  const t1 = Date.now();
  const noIdx = await DemoIssue.find({ status: 'Closed' });
  const dt1 = Date.now() - t1;
  log(`Gefunden: ${noIdx.length}, Zeit: ${dt1}ms`);
  const explain1 = await DemoIssue.find({ status: 'Closed' }).explain('executionStats');
  const stage1 = explain1.executionStats.executionStages.stage || 'unknown';
  const examined1 = explain1.executionStats.totalDocsExamined;
  log(`Stage: ${stage1} (COLLSCAN = jedes Dokument anschauen)`);
  log(`Dokumente angeschaut: ${examined1} von 5'000 (alle, weil kein Index)`);

  step('3. Index auf status erstellen');
  await DemoIssue.collection.createIndex({ status: 1 });
  log('Index { status: 1 } erstellt');

  step('4. Gleiche Query MIT Index');
  const t2 = Date.now();
  const withIdx = await DemoIssue.find({ status: 'Closed' });
  const dt2 = Date.now() - t2;
  log(`Gefunden: ${withIdx.length}, Zeit: ${dt2}ms`);
  const explain2 = await DemoIssue.find({ status: 'Closed' }).explain('executionStats');
  const stage2 =
    explain2.executionStats.executionStages.inputStage?.stage ||
    explain2.executionStats.executionStages.stage || 'unknown';
  const examined2 = explain2.executionStats.totalDocsExamined;
  log(`Stage: ${stage2} (IXSCAN = nur passende Dokumente anschauen)`);
  log(`Dokumente angeschaut: ${examined2} (statt 5'000)`);
  log(`\n→ Speed: ${dt1}ms ohne Index → ${dt2}ms mit Index`);
  log("→ Bei 5'000 klein, bei 5 Mio waere der Unterschied dramatisch");

  step('5. Text-Index — die Buch-Andeutung fuer eine Suchleiste');
  await DemoIssue.collection.createIndex({ title: 'text' });
  log("Text-Index { title: 'text' } erstellt");
  const found = await DemoIssue.find({ $text: { $search: 'login' } }).limit(3);
  log(`Volltext-Suche nach "login": ${found.length} Treffer (erste 3)`);
  found.forEach((d) => log(`  → ${d.title}`));
  log('→ Genau das Werkzeug fuer eine echte Suchleiste, statt langsamer Regex-Suche');

  await disconnect();
  console.log("\n✓ Uebung 3 durch. 5'000 Issues + status_1 + title_text liegen in der DB.");
  console.log('  In Atlas/Compass: "Explain Plan" auf einer Query → IXSCAN bestaetigt sich.\n');
}

main().catch((err) => {
  console.error('✗ Fehler:', err);
  process.exit(1);
});
