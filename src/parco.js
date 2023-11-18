// import { storeArtist } from './database.js';
import { getAllArtists, getAllArtistsTmp } from './wasabi.js'

// var test = await getAllArtists();

var test = await getAllArtistsTmp();

console.log(test[0]);

// storeArtist(test);