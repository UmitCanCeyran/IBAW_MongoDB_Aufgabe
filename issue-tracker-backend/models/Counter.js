const mongoose = require('mongoose');

/**
 * Counter-Collection fuer das getNextSequence-Pattern (Uebung 5 im Buch).
 *
 * Ein Dokument pro Sequenz: _id = Name der Sequenz (z.B. "issues"),
 * current = der zuletzt vergebene Wert.
 *
 * Warum ueberhaupt? Wuerde ich die naechste id ueber count()+1 bilden,
 * koennten zwei gleichzeitige Requests dieselbe Zahl ziehen (Race Condition).
 * Ein atomares findOneAndUpdate mit $inc garantiert dagegen, dass jeder
 * Aufruf eine eindeutige, fortlaufende Zahl bekommt.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String },
  current: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
