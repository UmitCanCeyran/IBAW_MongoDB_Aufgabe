const Issue = require('../models/Issue');
const Counter = require('../models/Counter');

/**
 * getNextSequence - liefert atomar die naechste Zahl einer Sequenz.
 * Direkt das Pattern aus dem Buch (Kapitel 6, "Writing to MongoDB"),
 * nur in Mongoose-Syntax.
 *
 * findOneAndUpdate mit $inc ist eine einzige atomare Operation: lesen,
 * hochzaehlen und zurueckgeben passieren ohne Luecke dazwischen. Mit
 * { new: true } bekomme ich den Wert NACH dem Inkrement, mit
 * { upsert: true } wird der Counter beim allerersten Aufruf angelegt.
 */
async function getNextSequence(name) {
  const result = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { new: true, upsert: true }
  );
  return result.current;
}

/**
 * CREATE - POST /api/issues
 * Legt ein Issue an. Die menschenlesbare id kommt aus dem Counter.
 * Danach lese ich das gespeicherte Dokument zurueck (Uebung 5:
 * "trust but verify" - die DB ist die Source of Truth, inkl. aller Defaults).
 */
async function createIssue(req, res) {
  try {
    const issue = req.body;
    issue.id = await getNextSequence('issues');
    issue.created = new Date();

    const result = await Issue.create(issue);
    res.status(201).json(result);
  } catch (err) {
    // z.B. fehlender Titel (required) -> Validation-Error von Mongoose
    res.status(400).json({ message: err.message });
  }
}

/**
 * READ (Liste) - GET /api/issues
 * Optionaler Filter ueber Query-Parameter, z.B. /api/issues?status=New
 * oder /api/issues?owner=Ravan. Das Filter-Objekt ist ein JS-Objekt,
 * kein JSON (Uebung 2) - genau deshalb kann ich es Stueck fuer Stueck
 * zusammenbauen.
 */
async function listIssues(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.owner) filter.owner = req.query.owner;

    const issues = await Issue.find(filter).sort({ id: 1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * READ (einzeln) - GET /api/issues/:id
 * Sucht ueber die menschenlesbare id, nicht ueber die _id.
 */
async function getIssue(req, res) {
  try {
    const issue = await Issue.findOne({ id: Number(req.params.id) });
    if (!issue) return res.status(404).json({ message: 'Issue nicht gefunden' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * UPDATE - PUT /api/issues/:id
 * $set passiert intern durch Mongoose. { new: true } gibt mir das
 * Dokument NACH der Aenderung zurueck, runValidators prueft das enum/required.
 */
async function updateIssue(req, res) {
  try {
    const update = req.body;
    delete update.id;   // die fortlaufende id darf nicht ueberschrieben werden
    delete update._id;

    const issue = await Issue.findOneAndUpdate(
      { id: Number(req.params.id) },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!issue) return res.status(404).json({ message: 'Issue nicht gefunden' });
    res.json(issue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/**
 * DELETE - DELETE /api/issues/:id
 */
async function deleteIssue(req, res) {
  try {
    const result = await Issue.findOneAndDelete({ id: Number(req.params.id) });
    if (!result) return res.status(404).json({ message: 'Issue nicht gefunden' });
    res.json({ message: `Issue ${req.params.id} geloescht`, deleted: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createIssue,
  listIssues,
  getIssue,
  updateIssue,
  deleteIssue,
};
