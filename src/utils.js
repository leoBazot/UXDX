/* UTILS */

const CURRENT_YEAR = new Date().getFullYear()

export function getGenres(artist) {
    return artist.genres?.length === 0 ? artist.dbp_genre : artist.genres
}

export function getAge(artist) {
    var result = 0
    var beginSplit = artist.lifeSpan?.begin?.split("-")
    var endSplit = artist.lifeSpan?.end?.split("-")
    if (beginSplit?.length != 1 || endSplit?.length != 1) {
        result = beginSplit[0] === "" ? 0 : (artist.lifeSpan?.ended ? endSplit[0] - beginSplit[0] : CURRENT_YEAR - beginSplit[0])
    } else {
        result = artist.lifeSpan?.begin === "" ? 0 : (artist.lifeSpan?.ended ? artist.lifeSpan?.end : CURRENT_YEAR) - artist.lifeSpan?.begin
    }
    return result
}

export function getCountry(artist) {
    return artist.location?.country ?? "UNKNOWN"
}

export function getAllNames(data) {
    let result = []
    data.forEach(d => {
        if (!result.includes(d.artist)) {
            result.push(d.artist)
        }
    })
    return result
}

export function getArtistByName(name) {
    return database.find(artist => artist.name === name)
}

export function getSongsByArtist(artist) {
    var result = []
    let genres = getGenres(artist) ?? ["UNKNOWN"]

    genres?.forEach(g => {
        var stats = {}
        stats.artist = artist.name
        var c = getCountry(artist)
        stats.country = c === "" ? "UNKNOWN" : c
        stats.age = getAge(artist)
        stats.genre = g
        stats.nbExplicit = artist.albums.map(album => album.songs.map(song => song.explicit_content_lyrics ?? 0)).flat().reduce((a, b) => a + b, 0)
        stats.deezerFans = artist.deezerFans ?? 0

        result.push(stats)
    })

    return result
}



export function getAllArtistStats(artists) {
    let result = []
    artists.forEach(artist => {
        result = result.concat(getSongsByArtist(artist))
    })

    return result
}

export function getAllLanguages(data) {
    let result = []
    data.forEach(artist => {
        if (!result.includes(artist.language)) {
            result.push(artist.language)
        }
    })

    return result
}

export function getAllGenres(data) {
    let result = []
    data.forEach(artist => {
        if (!result.includes(artist.genre)) {
            result.push(artist.genre)
        }
    })
    return result
}

export function getAllCountry(data) {
    let result = []
    data.forEach(artist => {
        if (!result.includes(artist.country)) {
            result.push(artist.country)
        }
    })
    return result
}