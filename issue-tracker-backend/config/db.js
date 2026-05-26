const mongoose = require('mongoose');

/**
 * Verbindet einmalig beim Server-Start mit MongoDB Atlas.
 *
 * Bewusst hart: schlaegt der initiale Connect fehl, beenden wir den
 * Prozess (exit 1). Eine halb funktionierende App mit kaputter DB
 * ist schlimmer als ein sauberer Absturz - ein Container-/Service-
 * Manager startet dann einfach neu.
 *
 * Den laufenden Reconnect bei kurzen Aussetzern uebernimmt Mongoose
 * danach von selbst (Connection-Pool + Auto-Reconnect, Default-Einstellungen).
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB verbunden: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB-Verbindungsfehler: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
