const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/photoes", async (req, res) => {
	const albumId = req.query.albumId;

	const result = await fetch(`https://jsonplaceholder.typicode.com/photos`);

	const data = await result.json();

	res.status(200).json(data);
});

app.get("/photos:id", async (req, res) => {
	const result = await fetch(
		`https://jsonplaceholder.typicode.com/photos/${req.params.id}`
	);

	const data = result.json();

	res.status(200).json(data);
});

app.listen(3001);
