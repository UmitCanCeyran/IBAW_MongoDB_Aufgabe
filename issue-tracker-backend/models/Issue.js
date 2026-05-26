const mongoose = require('mongoose');

/**
 * Issue-Schema - die Felder stammen 1:1 aus dem Issue Tracker des Buchs
 * (Pro MERN Stack 2, Kapitel 6, Listing 6-3).
 *
 * Statt der _id (ObjectId) nutze ich wie im Buch ein eigenes, menschen-
 * lesbares Feld `id` (eine fortlaufende Zahl). Erzeugt wird die im
 * Controller ueber den Counter (getNextSequence-Pattern, Uebung 5).
 */
const issueSchema = new mongoose.Schema({
  // Menschenlesbare ID (1, 2, 3 ...), eindeutig - kommt aus dem Counter.
  id: { type: Number, unique: true },

  // Pflichtfeld - ohne Titel kein Issue.
  title: { type: String, required: true },

  // Begrenzte Auswahl an Zustaenden (Schema-Validation auf Mongoose-Ebene).
  status: {
    type: String,
    enum: ['New', 'Assigned', 'Fixed', 'Closed'],
    default: 'New',
  },

  owner: { type: String },           // Wer kuemmert sich drum
  effort: { type: Number },          // Aufwand in Personentagen
  created: { type: Date, default: Date.now },
  due: { type: Date },               // Faelligkeitsdatum (optional)
});

// Indizes wie im Init-Skript des Buchs (Listing 6-3).
// id ist bereits durch `unique: true` oben indiziert; hier die Felder,
// nach denen typischerweise gefiltert oder sortiert wird.
issueSchema.index({ status: 1 });
issueSchema.index({ owner: 1 });
issueSchema.index({ created: 1 });

module.exports = mongoose.model('Issue', issueSchema);
