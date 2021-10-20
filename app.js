const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
db = null;
initializeDBAndResponseObject = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndResponseObject();

const convertMovieDBObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDBObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const moviesQuery = `SELECT * FROM movie;`;
  const moviesArray = await db.all(moviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postQuery = `
  INSERT INTO 
  movie(director_id,movie_name,lead_actor)
  VALUES(${directorId},${movieName},${leadActor});`;
  await db.run(postQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const idGetQuery = `SELECT * 
  FROM 
  movie 
  WHERE 
  movie_id=${movieId};`;
  const dbResponse = await db.get(idGetQuery);
  response.send(convertMovieDBObjectToResponseObject(dbResponse));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateQuery = `
    UPDATE 
     movie 
    SET 
     director_id:${directorId},
     movie_name:${movieName},
     lead_actor:${leadActor},
    WHERE 
     movie_id=${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie WHERE movie_id=${movieId};`;
  const dbResponse = await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const idGetQuery = `SELECT * FROM director;`;
  const dbResponse = await db.all(idGetQuery);
  response.send(
    dbResponse.map((eachDirector) => {
      convertDirectorDBObjectToResponseObject(eachDirector);
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
