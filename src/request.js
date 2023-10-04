import { WASABI_API_BASE_URL, API_V1_ACCESS, SEARCH_ACCESS } from './const'

function Request(access, search) {
    return fetch(encodeURI(`${WASABI_API_BASE_URL}/${access}/${search}`))
        .then(response => response.json())
        .catch(error => error.json())
}

function apiRequest(search) {
    return Request(API_V1_ACCESS, search)
}

function searchRequest(search) {
    return Request(SEARCH_ACCESS, search)
}

export { apiRequest, searchRequest }