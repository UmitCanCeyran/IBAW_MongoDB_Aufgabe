# Playground — MongoDB-Aufgaben (Kapitel 6)

Lauffähige Demo-Skripte zu den fünf Übungen aus Kapitel 6 von
*Pro MERN Stack 2*. Jedes Skript zeigt ein Konzept Schritt für Schritt an
laufenden Beispielen — passend zum Übungsdokument (`MongoDB-Aufgaben.pdf`).

Alle Skripte verbinden sich gegen eine **separate Spielwiese-Datenbank**
(`issuetracker_playground`) auf MongoDB Atlas und lassen die echte
`issuetracker`-DB des Backends komplett in Ruhe.

## Voraussetzungen

- **Node.js 18+**
- **Ein MongoDB-Atlas-Account** mit Cluster und Connection-String
  (derselbe wie für das Backend)

## Setup

```bash
npm install

# .env aus der Vorlage anlegen und den Atlas-String eintragen
cp .env.example .env
```

Die Skripte schneiden den DB-Namen aus dem String und ersetzen ihn durch
`issuetracker_playground` — egal was in der `.env` steht, geschrieben wird
nur in die Spielwiese.

## Die fünf Übungen

```bash
node 01-cursor.js      # Übung 1: Cursor-Methoden
node 02-crud.js        # Übung 2: $exists, Filter, $unset, Index-Richtung
node 03-indizes.js     # Übung 3: COLLSCAN vs IXSCAN, Text-Index
node 04-connection.js  # Übung 4: Connection-Pool, toArray vs Cursor-Streaming
node 05-write.js       # Übung 5: create(), getNextSequence, $inc atomar
```

Jedes Skript putzt zuerst seine Demo-Collection (frische Spielwiese),
befüllt sie neu und zeigt Schritt für Schritt, was passiert. Der Endzustand
bleibt in der DB, sodass man in **MongoDB Compass** oder im **Atlas-Web-UI**
nachschauen kann.

Jedes Skript ist idempotent — beliebig oft wiederholbar.

## Komplett aufräumen

```bash
node _reset.js
```

Droppt alle Demo-Collections in `issuetracker_playground`.

## Tipp

Compass oder das Atlas-UI parallel offen lassen mit
`issuetracker_playground` als aktiver DB. Dann sieht man jedes
`insertOne`, `$unset` und `createIndex` quasi live — lesen, tippen, sehen.

---

*Ümit Can Ceyran — IBAW, Master in Web Engineering*
