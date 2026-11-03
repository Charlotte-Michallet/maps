// Entrée du processus : charge la configuration, démarre HTTP et gère l'arrêt.
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { connectDB, pool } from './db/connection.js';

const config = loadConfig();
const app = createApp(config);

async function startServer() {
  try {
    // 1. Connexion à SQL Server
    await connectDB();

    // 2. Démarrage du serveur HTTP uniquement si la DB est connectée
    const server = app.listen(config.port, () => {
      console.log(`DriveSpots écoute sur http://localhost:${config.port}.`);
    });

    // 3. Gestion de l'arrêt propre
    async function shutdown() {
      console.log('Arrêt du serveur...');

      server.close(async () => {
        try {
          await pool.close();
          console.log('Connexion SQL Server fermée.');
          process.exit(0);
        } catch (err) {
          console.error('Erreur lors de la fermeture SQL Server:', err);
          process.exit(1);
        }
      });
    }

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('Impossible de démarrer le serveur :', err.message);
    process.exit(1);
  }
}

startServer();
