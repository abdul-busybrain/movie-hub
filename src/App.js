import { useEffect, useState } from "react";

// Helper functions to calculate the average of an array of numbers
const average = (arr) =>
  arr.reduce(
    (accumulator, curVal, index, array) => accumulator + curVal / array.length,
    0
  );

// API key for the OMDB API
const API_KEY = "6a5d867c";

export default function App() {
  // Step 2 Implementing the search functionality
  const [query, setQuery] = useState("salah");

  // Step 3 Fetch movie data from the API
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 5 Implementing movie selection
  const [selectedId, setSelectedId] = useState(null);

  // Step 5 Create handleSelectMovie function
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  // Step 7 Implementing the watched movies list
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return JSON.parse(storedValue);
  });

  // Step 6 Add close functionality
  function handleCloseMovie() {
    setSelectedId(null);
  }

  // Step 3 Implement useEffect hook to fetch movies
  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`
          );

          if (!response.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await response.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (error) {
          if (error.name !== "AbortError") setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovies();
    },
    [query]
  );

  // Step 1 Setting up the main App component
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* Step 4 Implement conditional rendering for loading and error states */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          <MovieDetails
            selectedId={selectedId}
            onCloseMovie={handleCloseMovie}
          />
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </Box>
      </Main>
    </>
  );
}

// Step 3 Loading component
function Loader() {
  return <p className="loader">Loading...</p>;
}

// Step 3 Error message component
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>📛</span>
      {message}
    </p>
  );
}

// Step 1 Navbar component
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

// Step 1 Logo component
function Logo() {
  return (
    <div className="logo">
      <span role="img">🎥</span>
      <h1>movieHUB</h1>
    </div>
  );
}

// Step 2 Search component
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(event) => setQuery(event.target.value)}
    />
  );
}

// Step 2
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// Step 1 Main component
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// Step 1 Box component
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "-" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

// Step 4 Movie list
function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

// Step 4 Movie Component
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// Step 6 MovieDetail component
function MovieDetails({ selectedId, onCloseMovie }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // Step 6 Fetch and display detailed information for the selected movie
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedId}`
        );
        const data = await response.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

// Step 7 WatchedSummary component
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length}</span>
        </p>
        <p>
          <span>⭐</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

// Step 7 Watched Movies List component
function WatchedMoviesList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}

// Step 7 WatchedMovie component
function WatchedMovie({ movie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
