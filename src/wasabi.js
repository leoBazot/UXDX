import { apiRequest, searchRequest } from './request.js'

function getArtistByName(name) {
    return apiRequest(`artist/name/${name}`)
}

function fullTextSearch(search) {
    return searchRequest(`fulltext/${search}`)
}




export { getArtistByName, fullTextSearch }