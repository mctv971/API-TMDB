import dotenv from 'dotenv';
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
const TMDB_API_KEY_BEARER = process.env.TMDB_API_KEY_BEARER;

// Rechercher un film et obtenir ses données
async function getSearchMovieId(name) {
    const id_movie = await (await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(name)}&api_key=${TMDB_API_KEY}&page=1`)).json();
    return id_movie.results[0]?.id;
}
  
export async function getSearchMovieData(name) {
    const id_movie = await getSearchMovieId(name);
    if (!id_movie) {
        throw new Error('Film introuvable');}

    const data = await (await fetch(`${TMDB_BASE_URL}/movie/${id_movie}?api_key=${TMDB_API_KEY}`)).json();
    await addWatchList(id_movie);
    const title = data.original_title;
    const overview = data.overview;
    console.log(`Le film ${title} a pour overview : ${overview}`);
  }
  
// Ajouter un film à la watch list
export async function addWatchList(id_movie) {
  const url = `${TMDB_BASE_URL}/account/20656866/watchlist`;
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${TMDB_API_KEY_BEARER}`
    },
    body: JSON.stringify({ media_type: 'movie', media_id: id_movie, watchlist: true })
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout à la watch list');
    }
    console.log('Film ajouté à la watch list.');
  } catch (err) {
    console.error(err);
  }
}

// Obtenir la watch list
export async function getWatchList() {
  const url = `${TMDB_BASE_URL}/account/20656866/watchlist/movies?language=en-US&page=1&sort_by=created_at.asc`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_API_KEY_BEARER}`
    }
  };

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    console.log('Watch list:', json);
    return json;
  } catch (err) {
    console.error(err);
  }
}
export async function getMovieDetails(query) {
  const id_movie = await getSearchMovieId(query);
  if (!id_movie) {
    return reply.status(404).send({ error: 'Film introuvable.' });
  }

  const data = await (await fetch(`${TMDB_BASE_URL}/movie/${id_movie}?api_key=${TMDB_API_KEY}`)).json();
  return data;
  
}
// Supprimer un film de la watch list
export async function deleteWatchList(name) {
    const id_movie = await getSearchMovieId(name);
    const url = `${TMDB_BASE_URL}/account/20656866/watchlist`;
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY_BEARER}`
      },
      body: JSON.stringify({ media_type: 'movie', media_id: id_movie, watchlist: false })
    };
  
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression à la watch list');
      }
      console.log('Film supprimé à la watch list.');
    } catch (err) {
      console.error(err);
    }
  }
