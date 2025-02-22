import Fastify from 'fastify';
import cors from '@fastify/cors';
import path from 'path';
import fs from 'fs/promises';

import {getSearchMovieData, addWatchList, getWatchList, getMovieDetails, deleteWatchList} from  './tmdb.js';

const fastify = Fastify({
  logger: true
});

// Récupère le répertoire du fichier actuel
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Décoder le chemin en cas de caractères spéciaux
const decodedDir = decodeURIComponent(__dirname);


// Route principale qui sert le contenu de 'index.html'
fastify.get('/', async (request, reply) => {
  try {
    const filePath = path.join(decodedDir, 'public', 'index.html');
    console.log('Chemin du fichier index.html :', filePath); // Affiche le chemin pour vérifier
    const html = await fs.readFile(filePath, 'utf-8');
    reply.type('text/html').send(html); // Spécifie le type MIME pour HTML
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier :', err); // Affiche l'erreur complète
    reply.code(500).send('Erreur : Impossible de charger la page.');
  }
});

// Ajout du plugin CORS
fastify.register(cors, {
  origin: '*', // Permet toutes les origines (peut être restreint pour plus de sécurité)
  methods: ['GET', 'POST', 'DELETE'], // Autorise uniquement ces méthodes HTTP
});

// Routes
fastify.get('/search', async (request, reply) => {
  const { query } = request.query;
  if (!query) {
    return reply.status(400).send({ error: 'Le paramètre "query" est requis.' });
  }

  try {
    const data = await getMovieDetails(query);
    return data;
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Erreur lors de la recherche du film.' });
  }
});

fastify.post('/watchlist/add', async (request, reply) => {
  const { name } = request.body;
  if (!name) {
    return reply.status(400).send({ error: 'Le paramètre "name" est requis.' });
  }

  try {
    await getSearchMovieData(name);
    return { message: 'Film ajouté à la watch list.' };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Erreur lors de l\'ajout à la watch list.' });
  }
});

fastify.post('/watchlist/delete', async (request, reply) => {
  const { name } = request.body;
  if (!name) {
    return reply.status(400).send({ error: 'Le paramètre "name" est requis.' });
  }

  try {
    await deleteWatchList(name);
    return { message: 'Film supprimé à la watch list.' };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Erreur lors de la suppression à la watch list.' });
  }
});


fastify.get('/watchlist', async (request, reply) => {
  try {
    const watchList = await getWatchList();
    return watchList;
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Erreur lors de la récupération de la watch list.' });
  }
});


/**
 * Run the server!
 */
// Lancement du serveur avec un port dynamique
const start = async () => {
  try {
    const port = process.env.PORT || 3000; // Utilise le port défini par Render, ou 3000 en local
    const host = process.env.HOST || '0.0.0.0'; // Utilise l'hôte défini par Render, ou localhost en local

    await fastify.listen({ port, host });
    console.log(`Serveur démarré sur http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
