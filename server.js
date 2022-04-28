const express = require("express");
const cors = require("cors");
const Redis = require("redis");
// const { createClient } = require("redis");

// Point: Start Srver
// sudo service redis-server start
const redisClient = Redis.createClient(); // Note: Pass URL for the production!
const DEFAULT_EXPIRATION = 3600;
(async () => {
	await redisClient.connect();
	redisClient.on("error", (err) => console.log("Redis Client Error", err));
})();

const app = express();
app.use(cors());

app.get("/photoes", async (req, res) => {
	const photoes = await redisClient.get("photoes");

	if (photoes !== null) {
		res.status(200).json(JSON.parse(photoes));
	} else {
		// Point: Cache
		const result = await fetch(
			`https://jsonplaceholder.typicode.com/photos`
		);

		const data = await result.json();

		await redisClient.setEx(
			"photoes",
			DEFAULT_EXPIRATION,
			JSON.stringify(data)
		);

		res.status(200).json(data);
	}
});

app.get("/photos:id", async (req, res) => {
	const result = await fetch(
		`https://jsonplaceholder.typicode.com/photos/${req.params.id}`
	);

	const data = result.json();

	res.status(200).json(data);
});

app.listen(3001);

// flushall // Note: Clear redis cache
// keys * // Note: Get all keys
