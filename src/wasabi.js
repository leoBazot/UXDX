import { apiRequest, searchRequest } from './request.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getArtistByName(name) {
    return await apiRequest(`artist/name/${name}`)
}

async function fullTextSearch(search) {
    return await searchRequest(`fulltext/${search}`)
}

async function getAllArtists() {
    var result = [];
    for (let i = 0; i <= 7400; i += 200) {
        result.fill(await apiRequest(`artist_all/${i}`));
        console.log("got artist from " + i + " to " + (i + 200));
        await sleep(500);
    }
    return result;
}

async function getAllArtistsTmp() {

    return fetch('./data.json')
        .then(response => response.json())
        .catch(error => {
            console.log("Fetch error");
            console.log(error);
        });
}

export { getArtistByName, fullTextSearch, getAllArtists, getAllArtistsTmp }