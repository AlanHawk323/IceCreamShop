const express = require("express");
const app = express();
const pg = require("pg");
const client = new pg.Client("postgres://localhost/icecream")

app.get("/", (req, res, next) => {
    res.send("we are connected to the server");
});

app.get("/api/icecream", async(req, res, next) => {
    try{
        const SQL = 'SELECT * FROM icecream;'
        const response = await client.query(SQL);
        console.log(response.rows);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.use("/", (req, res, next) => {
    console.log("I am in this express server!");
    next();
});

app.get("/api/icecream:id", async(req, res, next) => {
    try {
    const SQL = `SELECT * FROM icecream WHERE id=$1;`;
    const response = await client.query(SQL, [req.params.id]);
    console.log(response.rows);
    if(!response.rows.length){
        next({
            name: "MissingIDError",
            message: `Ice cream with id ${req.params.id} not found`,
        });
    }    

    res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});

app.delete("/api/icecream/id/:id", async (req, res, next) => {
    console.log("req.params.id", req.params.id);
    
// * = All Data
    const SQL = `DELETE FROM icecream WHERE id=$1 RETURNING *`
    const response = await client.query(SQL, [req.params.id]);
    console.log(response.rows);
    res.sendStatus(204);
});

//Error Handler!
app.use((error, req, res, next) => {
    res.status(500);
    res.send(error);
});

const start = async() =>
//Connect to the database:
    {client.connect();

        const SQL =
        `DROP TABLE IF EXISTS icecream;
        CREATE TABLE icecream(
            id SERIAL PRIMARY KEY
            name VARCHAR(25)
        );
        INSERT INTO icecream(name) VALUES ('chocolate');
        INSERT INTO icecream(name) VALUES ('vanilla');
        INSERT INTO icecream(name) VALUES ('strawberry');
        DELETE FROM icecream WHERE id=1;
        `;

        await client.query(SQL);

        const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`The server is listening on port ${port}`);
    });
    };

start();