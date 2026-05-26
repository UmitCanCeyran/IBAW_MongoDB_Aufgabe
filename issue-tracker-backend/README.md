# Issue Tracker Backend

Ein kleines REST-Backend auf Basis von **Express + Mongoose + MongoDB Atlas**.
Entstanden als Abgabe für das IBAW-Modul *Datenbanksysteme* zu Kapitel 6 von
*Pro MERN Stack 2*. Die App ist der Issue Tracker aus dem Buch — nur als
eigenständiges Backend, das die Persistenz mit MongoDB Atlas umsetzt.

**3E:** Einfach. Eigenständig. Effizient. Kein Auth, kein Frontend, kein
Deploy-Ballast — nur sauberes CRUD gegen eine echte Cloud-Datenbank.

---

## Was kann es?

Ein vollständiges CRUD-API für *Issues* (Tickets/Aufgaben):

| Methode | Route               | Zweck                                   |
|---------|---------------------|-----------------------------------------|
| POST    | `/api/issues`       | Neues Issue anlegen                     |
| GET     | `/api/issues`       | Alle Issues (optional gefiltert)        |
| GET     | `/api/issues/:id`   | Ein Issue per id                        |
| PUT     | `/api/issues/:id`   | Issue ändern                            |
| DELETE  | `/api/issues/:id`   | Issue löschen                           |

Ein *Issue* hat die Felder aus dem Buch: `id`, `title` (Pflicht), `status`
(`New`/`Assigned`/`Fixed`/`Closed`), `owner`, `effort`, `created`, `due`.

---

## Voraussetzungen

- **Node.js 18+** (für `fetch` und modernes ES)
- **Ein MongoDB-Atlas-Account** (kostenlos)

---

## Schritt 1 — MongoDB Atlas einrichten

1. Account erstellen auf <https://www.mongodb.com/cloud/atlas/register>.
2. **Cluster anlegen:** „Create" → den kostenlosen Tarif **M0** wählen,
   Region in der Nähe (z. B. Frankfurt/Zürich), Cluster erstellen.
3. **Datenbank-User anlegen:** linkes Menü → *Database Access* → *Add New
   Database User*. Benutzername + Passwort vergeben (Passwort merken!).
4. **Netzwerk freigeben:** *Network Access* → *Add IP Address*. Für die
   Entwicklung reicht *Allow Access from Anywhere* (`0.0.0.0/0`).
5. **Connection-String holen:** Beim Cluster auf *Connect* → *Drivers* →
   den String kopieren. Er sieht so aus:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Schritt 2 — Projekt einrichten

```bash
# Abhängigkeiten installieren
npm install

# .env aus der Vorlage erstellen
cp .env.example .env
```

Dann die `.env` öffnen und den **echten** Connection-String eintragen.
`<user>` und `<password>` durch deine Atlas-Zugangsdaten ersetzen und den
Datenbanknamen `issuetracker` direkt vor das `?` setzen:

```
MONGODB_URI=mongodb+srv://meinuser:meinpasswort@cluster0.xxxxx.mongodb.net/issuetracker?retryWrites=true&w=majority
PORT=3000
```

> Die `.env` ist in `.gitignore` und wird **nie** committet — das Passwort
> bleibt lokal.

---

## Schritt 3 — Starten

```bash
# Datenbank mit zwei Beispiel-Issues befüllen (optional, aber praktisch)
npm run seed

# Server starten
npm start
```

Bei Erfolg:

```
MongoDB verbunden: cluster0-shard-00-00.xxxxx.mongodb.net
Server laeuft auf Port 3000
```

---

## Schritt 4 — Testen

Mit `curl` (oder Postman / Thunder Client / Insomnia):

```bash
# Issue anlegen
curl -X POST http://localhost:3000/api/issues \
  -H "Content-Type: application/json" \
  -d '{"title":"Login-Button reagiert nicht","owner":"Umit","effort":3}'

# Alle Issues
curl http://localhost:3000/api/issues

# Nur die mit status=New
curl "http://localhost:3000/api/issues?status=New"

# Ein Issue ändern (id 1)
curl -X PUT http://localhost:3000/api/issues/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"Assigned"}'

# Ein Issue löschen
curl -X DELETE http://localhost:3000/api/issues/1
```

In **MongoDB Compass** oder im **Atlas-Web-UI** (*Browse Collections*) kannst
du parallel zuschauen, wie die Dokumente in der `issuetracker`-Datenbank
entstehen und sich ändern.

---

## Projektstruktur

```
issue-tracker-backend/
├── server.js                  # Einstiegspunkt: erst DB verbinden, dann lauschen
├── config/
│   └── db.js                  # Mongoose-Connection gegen Atlas
├── models/
│   ├── Issue.js               # Issue-Schema + Indizes
│   └── Counter.js             # Counter für fortlaufende ids
├── controllers/
│   └── issueController.js     # CRUD-Logik + getNextSequence
├── routes/
│   └── issueRoutes.js         # HTTP-Routen
├── scripts/
│   └── seed.js                # Beispieldaten (Pendant zu init.mongo.js)
├── .env.example               # Vorlage für die Konfiguration
└── .gitignore
```

---

## Bezug zu Kapitel 6 (Pro MERN Stack 2)

Dieses Backend setzt die Konzepte aus dem Kapitel in echtem Code um:

- **CRUD-Operationen** — alle fünf Handler im Controller (Create/Read/Update/Delete).
- **Schema & Indizes** — `Issue.js` definiert Felder, Pflichtfeld (`required`),
  erlaubte Werte (`enum`) und Indizes auf `status`, `owner`, `created` —
  wie im Init-Skript des Buchs (Listing 6-3).
- **Filter sind JS-Objekte, kein JSON** — in `listIssues` baue ich das
  Filter-Objekt schrittweise aus den Query-Parametern zusammen.
- **getNextSequence mit `$inc`** — atomarer Counter für fortlaufende,
  menschenlesbare ids ohne Race Conditions (Buch: „Writing to MongoDB").
- **„Trust but verify"** — beim Anlegen kommt das gespeicherte Dokument
  inklusive aller Defaults zurück (`Issue.create` gibt es direkt zurück).
- **Connection-Handling** — `db.js` verbindet einmalig mit Hard-Exit bei
  Fehler; den laufenden Reconnect übernimmt Mongoose selbst.

---

*Ümit Can Ceyran — IBAW, Master in Web Engineering*
