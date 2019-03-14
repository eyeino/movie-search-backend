/* eslint-disable no-console */
var restify = require('restify');
const corsMiddleware = require('restify-cors-middleware')
var fetch = require('node-fetch');

const baseApiUrl = 'https://api.themoviedb.org/3';
const baseImgUrl = 'https://image.tmdb.org/t/p/w500';
const tmdbApiKey = 'f2799c880a5e603fc2412def4e867599';
const apiKeyQueryParam = 'api_key=' + tmdbApiKey;

let popularMoviesById = null;
let movieInfoCache = {};

function saveMovieInfoToCache(movieResult) {
  // "hasher"
  const movieKey = (movie) => {
    return movie.id
  }
  
  const movieObj = {
    id: movieResult.id,
    rating: movieResult.vote_average,
    title: movieResult.title,
    releaseDate: movieResult.release_date,
    posterUrl: baseImgUrl + movieResult.poster_path,
    summary: movieResult.overview
  }

  movieInfoCache[movieKey(movieObj)] = movieObj;
  console.log('Movie saved with title: ', movieObj.title);
}

async function getPopularMovies() {
  if (popularMoviesById === null) {
    // if empty make request for popular movies
    const endpoint = `${baseApiUrl}/discover/movie?sort_by=popularity.desc&${apiKeyQueryParam}`;
    
    try {
      popularMoviesById = [];

      const result = await fetch(endpoint)
        .then(data => data.json())
        .catch(error => console.warn(error));

      const resultArr = result.results;
      resultArr.map((movie) => {
        popularMoviesById.push(movie.id);
        saveMovieInfoToCache(movie);
      })
      console.log('saving popular movies from tmdb; returning fresh movies!')
      return popularMoviesById;
    } catch(error) {
      console.log(error);
    }

  } else {
    console.log('popular movies already downloaded; returning cached items');
    return popularMoviesById;
  }
}

async function getMovieSearchResults(searchTerm) {
  const endpoint = `${baseApiUrl}/search/movie?${apiKeyQueryParam}&query=${searchTerm}`;
  
  try {
    const result = await fetch(endpoint)
      .then(data => data.json())
      .catch(error => console.warn(error));

    const resultArr = result.results;
    const searchResultsById = [];
    resultArr.map((movie) => {
      searchResultsById.push(movie.id);
      saveMovieInfoToCache(movie);
    })

    console.log('found movies with search term: ', searchTerm);
    return searchResultsById;
  } catch(error) {
    console.log(error);
  }
}

async function respondWithPopularMovies(_req, res, next) {
  const popularMoviesById = await getPopularMovies();
  const popularMovies = popularMoviesById.map(id => movieInfoCache[id]);
  res.send(popularMovies);
  next();
}

function respondWithMovieGivenId(req, res, next) {
  const movie = movieInfoCache[req.params.id];
  res.send(movie);
  next();
}

async function respondWithSearchResults(req, res, next) {
  const query = req.query.q;
  const searchResultsById = await getMovieSearchResults(query);
  const searchResults = searchResultsById.map(id => movieInfoCache[id]);
  res.send(searchResults);
  next();
}

var server = restify.createServer();

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
  allowHeaders: ['X-App-Version']
})

server.pre(cors.preflight)
server.use(cors.actual)

server.get('/movie/:id', respondWithMovieGivenId);
server.head('/movie/:id', respondWithMovieGivenId);

server.get('/popular', respondWithPopularMovies);
server.head('/popular', respondWithPopularMovies);

server.use(restify.plugins.queryParser());
server.get('/search', respondWithSearchResults);
server.head('/search', respondWithSearchResults);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('%s listening at %s', server.name, server.url);
});