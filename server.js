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
	const albumId = req.query.albumId;
	const photoes = await getSetCache(
		`photoes?albumId=${albumId}`,
		async () => {
			// Point: Cache
			const result = await fetch(
				`https://jsonplaceholder.typicode.com/photos?albumId=${albumId}`
			);

			return await result.json();
		}
	);

	res.status(200).json(photoes);
});

app.get("/photoes/:id", async (req, res) => {
	const photo = await getSetCache(`photoes:${req.params.id}`, async () => {
		// Point: Cache
		const result = await fetch(
			`https://jsonplaceholder.typicode.com/photos/${req.params.id}`
		);

		return await result.json();
	});
	console.log(photo);
	res.status(200).json(photo);
});

async function getSetCache(key, callback) {
	const data = await redisClient.get(key);

	if (data) return JSON.parse(data);

	const newData = await callback();

	await redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(newData));

	return newData;
}

app.listen(3001);

// flushall // Note: Clear redis cache
// keys * // Note: Get all keys
