# MovieSearch™ backend for Lattice
## Usage (client perspective):
Send HTTP requests to this, assuming you're running locally on port 8080:
`http://localhost:8080/popular` to receive popular movies as JSON.
`http://localhost:8080/movie/::id::` to get info on a movie as JSON, where `::id::` is the movie ID number as defined by TMDB.
`http://localhost:8080/search?q=::query::` to search for movies matching your query, where `::query::` is your query.
## Usage (running this locally):
### Prerequisites:
You need to have `npm` installed to run this. I recommend using `nvm` for installation.

Use `git clone` and `cd` to that newly-cloned repository. Run `npm install` to install dependencies. Finally, run `npm index.js` to start the server locally.