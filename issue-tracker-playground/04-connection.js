/**
 * 04-connection.js — Demo zu Uebung 4 (Connection-Handling)
 *
 * Was ich hier zeige:
 *   den Mongoose-Connection-Pool inspizieren,
 *   .find() (alles auf einmal) vs Cursor-Streaming,
 *   den RAM-Verbrauch im Vergleich (aus process.memoryUsage()),
 *   Verbindungs-Events (disconnected, reconnected).
 *
 * Run:  node 04-connection.js
 */

const mongoose = require('mongoose');
const { connect, disconnect, step, log, DemoIssue } = require('./_shared');

function memMB() {
  return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
}

async function main() {
  await connect();

  step('1. Connection-Pool inspizieren');
  const conn = mongoose.connection;
  log(`State: ${conn.readyState} (1 = connected)`);
  log(`Host: ${conn.host}`);
  log(`DB: ${conn.name}`);
  log(`Pool-Size (max): ${conn.getClient().options.maxPoolSize ?? 'default 100'}`);
  log('→ Diesen Pool habe ich nirgends konfiguriert — Mongoose-Default greift');

  step('2. Verbindungs-Events abhoeren');
  conn.on('disconnected', () => log('  ⚠ disconnected!'));
  conn.on('reconnected', () => log('  ✓ reconnected!'));
  log('Listener installiert. (Wenn ich den Mongo-Server stoppe/starte, sehe ich die Events)');

  step("3. Setup — 10'000 Dokumente einfuegen");
  await DemoIssue.deleteMany({});
  const docs = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    title: `Bulk Issue ${i}`,
    status: 'New',
    effort: 1 + (i % 20),
  }));
  await DemoIssue.insertMany(docs);
  log(`Eingefuegt: 10'000 Dokumente. Heap nach Insert: ${memMB()} MB`);

  step('4. .find() — alles auf einmal in den Heap');
  const memBefore = memMB();
  const all = await DemoIssue.find({});
  const memAfter = memMB();
  log(`Heap vor find(): ${memBefore} MB`);
  log(`Heap nach find(): ${memAfter} MB (${all.length} Dokumente im RAM)`);
  log(`Differenz: +${memAfter - memBefore} MB`);
  log("→ Bei 10'000 ueberschaubar. Bei 1 Million wuerde der Heap explodieren.");

  step('5. Cursor-Streaming — ein Dokument nach dem anderen');
  const memBeforeCursor = memMB();
  let count = 0;
  let maxEffort = 0;
  const cursor = DemoIssue.find({}).cursor();
  for await (const issue of cursor) {
    if (issue.effort > maxEffort) maxEffort = issue.effort;
    count++;
  }
  const memAfterCursor = memMB();
  log(`Iteriert: ${count} Dokumente`);
  log(`Max effort gefunden: ${maxEffort}`);
  log(`Heap vor Cursor: ${memBeforeCursor} MB → nach Cursor: ${memAfterCursor} MB`);
  log('→ Heap bleibt klein — nur 1 Dokument gleichzeitig im RAM');
  log('→ Genau das, was ich fuer eine Million Dokumente brauchen wuerde');

  await disconnect();
  console.log("\n✓ Uebung 4 durch. 10'000 Bulk-Dokumente liegen in der DB.");
  console.log('  Der Cursor-vs-find-Heap-Unterschied bleibt im Output sichtbar.\n');
}

main().catch((err) => {
  console.error('✗ Fehler:', err);
  process.exit(1);
});
