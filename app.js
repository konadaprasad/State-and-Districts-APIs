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
const response_to_maps = (object) => {
  return {
    districtId: object.district_id,
    districtName: object.district_name,
    stateId: object.state_id,
    cases: object.cases,
    cured: object.cured,
    active: object.active,
    deaths: object.deaths,
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
  const addMovieQuery = `INSERT INTO 
    district (district_name,state_id,cases,cured,active,deaths) 
    VALUES 
   ("${districtName}",${stateId},${cases},${cured},${active},${deaths});`;
  const resultItem = await db.run(addMovieQuery);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getBookQuery = `SELECT * FROM district WHERE district_id=${districtId};`;
  const result = await db.get(getBookQuery);
  response.send(response_to_maps(result));
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `DELETE FROM  district WHERE  district_id=${districtId};`;
  await db.run(deleteQuery);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateQuery = `UPDATE district SET 
  district_name='${districtName}' ,state_id=${stateId}
  ,cases=${cases}, cured=${cured},active=${active},deaths=${deaths}
  WHERE district_id=${districtId};`;
  await db.run(updateQuery);
  response.send("District Details Updated");
});
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getBookQuery = `SELECT 
  SUM(cases) as totalCases,
   SUM(cured) as totalCured,
    SUM(active) as totalActive,
     SUM(deaths) as totalDeaths FROM district WHERE state_id=${stateId};`;
  const result = await db.get(getBookQuery);
  response.send({
    totalCases: result.totalCases,
    totalCured: result.totalCured,
    totalActive: result.totalActive,
    totalDeaths: result.totalDeaths,
  });
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getBookQuery = `SELECT state.state_name FROM district INNER JOIN state on district.state_id=state.state_id WHERE district.district_id=${districtId};`;
  const result = await db.get(getBookQuery);
  response.send({
    stateName: result.state_name,
  });
});

module.exports = app;
