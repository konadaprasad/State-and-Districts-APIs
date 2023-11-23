const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
const app = express();
app.use(express.json());
const connecting_server_and_db = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever Running");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
connecting_server_and_db();

const response_to_map = (object) => {
  return {
    stateId: object.state_id,
    stateName: object.state_name,
    population: object.population,
  };
};

app.get("/states/", async (request, response) => {
  const getQuery = `SELECT *  FROM  state;`;
  const result = await db.all(getQuery);
  response.send(
    result.map((item) => {
      return {
        stateId: item.state_id,
        stateName: item.state_name,
        population: item.population,
      };
    })
  );
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getBookQuery = `SELECT * FROM state WHERE state_id=${stateId};`;
  const result = await db.get(getBookQuery);
  response.send(response_to_map(result));
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  console.log(request.body);
  const addMovieQuery = `INSERT INTO 
    district (district_name,state_id,cases,cured,active,deaths) 
    VALUES 
   ("${districtName}",${stateId},${cases},${cured},${active},${deaths});`;
  console.log(addMovieQuery);
  const resultItem = await db.run(addMovieQuery);
  response.send("District Successfully Added");
});
