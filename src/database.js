import { DB_ARTISTS, MONGO_URI } from './const.js';
const { MongoClient } = require("mongodb");

const client = new MongoClient(MONGO_URI);

await client.connect();

function getArtistsDB() {
    return client.db(DB_ARTISTS);
}

function storeArtist(artist) {
    getArtistsDB().collection("artists").insertMany(artist);
}


// storeArtist(test);