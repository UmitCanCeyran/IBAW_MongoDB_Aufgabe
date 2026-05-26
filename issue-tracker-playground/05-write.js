/**
 * 05-write.js — Demo zu Uebung 5 (Write-Pattern)
 *
 * Was ich hier zeige:
 *   Mongoose .create() gibt das fertige Dokument zurueck (inkl. Defaults),
 *   warum "trust but verify" beim nackten Driver noetig waere,
 *   getNextSequence mit $inc — das Buch-Pattern, selbst nachgebaut,
 *   $inc als atomarer Counter unter 100 parallelen Requests.
 *
 * Run:  node 05-write.js
 */

const {
  connect, disconnect, step, log, pretty,
  DemoIssue, Counter,
} = require('./_shared');

async function getNextSequence(name) {
  const result = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { new: true, upsert: true }
  );
  return result.current;
}

async function main() {
  await connect();

  step('0. Frische Spielwiese — Daten + Counter weg');
  await DemoIssue.deleteMany({});
  await Counter.deleteMany({});

  step('1. Mongoose .create() — Defaults werden automatisch gesetzt');
  const newIssue = await DemoIssue.create({ title: 'Login reagiert nicht' });
  log('Mein Input hatte nur title. Was Mongoose zurueckgibt:');
  console.log(pretty(newIssue.toObject()));
  log('→ status: "New" (Default), created: gesetzt, _id: generiert');
  log('→ Beim nackten Driver braeuchte ich dafuer einen zweiten findOne()');

  step('2. getNextSequence — das Buch-Pattern, fortlaufende ids');
  for (let i = 0; i < 5; i++) {
    const next = await getNextSequence('issues');
    log(`Naechste Issue-ID: ${next}`);
  }

  step('3. $inc atomar — 100 parallele Aufrufe, keine Duplikate');
  await Counter.deleteMany({});
  const parallel = await Promise.all(
    Array.from({ length: 100 }, () => getNextSequence('issues'))
  );
  const unique = new Set(parallel);
  log(`100 parallele Aufrufe → ${unique.size} eindeutige Werte`);
  log(`Min: ${Math.min(...parallel)}, Max: ${Math.max(...parallel)}`);
  log('→ Genau 100 eindeutige, von 1 bis 100. Keine Race Condition.');
  log('→ Mit "lesen, +1, schreiben" haette ich Duplikate bekommen.');

  step('4. findOneAndUpdate mit upsert — atomares "create-or-fetch"');
  const r1 = await DemoIssue.findOneAndUpdate(
    { title: 'Einmaliges Issue' },
    { $setOnInsert: { status: 'New' } },
    { new: true, upsert: true }
  );
  log(`Erster Aufruf (existiert nicht): angelegt → ${r1._id}`);
  const r2 = await DemoIssue.findOneAndUpdate(
    { title: 'Einmaliges Issue' },
    { $setOnInsert: { status: 'New' } },
    { new: true, upsert: true }
  );
  log(`Zweiter Aufruf (existiert): zurueckgegeben → ${r2._id}`);
  log(`Gleiche _id? ${String(r1._id) === String(r2._id)}`);
  log('→ Idempotent: einmal anlegen, danach immer dasselbe Dokument zurueck');

  await disconnect();
  console.log('\n✓ Uebung 5 durch. demo_issues + counters-Collection liegen in der DB.');
  console.log('  In Atlas/Compass: counters-Doc zeigt current: 100 — Beweis dass $inc atomar ist.\n');
}

main().catch((err) => {
  console.error('✗ Fehler:', err);
  process.exit(1);
});
