import { getAllArtists, getAllArtistsTmp } from './wasabi.js'

var database = await getAllArtistsTmp();

const CURRENT_YEAR = new Date().getFullYear()

const SONG_KEYS = ["artist", "country", "age", "genre", "nbExplicit", "deezerFans"]

const selections = new Map();

/* MODE */

const MODE = {
    ALL: 0,
    ARTIST: 1,
}

var mode = MODE.ALL

// default is age
var colorBase = SONG_KEYS[2]

/* UTILS */
function getGenres(artist) {
    return artist.genres?.length === 0 ? artist.dbp_genre : artist.genres
}

function getAge(artist) {
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

function getCountry(artist) {
    return artist.location?.country ?? "UNKNOWN"
}

function getAllNames(data) {
    let result = []
    data.forEach(d => {
        if (!result.includes(d.artist)) {
            result.push(d.artist)
        }
    })
    return result
}

function getArtistByName(name) {
    return database.find(artist => artist.name === name)
}

function createSongInfos(artist, album, song, genres) {
    var result = []
    genres.forEach(genre => {
        let tmp = {}
        tmp.artist = artist.name
        tmp.country = getCountry(artist)
        tmp.age = getAge(artist)
        tmp.language = song.language === "" ? song.language_detect : song.language
        if (tmp.language === "") {
            tmp.language = "UNKNOWN"
        }

        tmp.bpm = song.bpm === "" ? "UNKNOWN" : song.bpm
        tmp.genre = genre
        tmp.releaseDate = album.releaseDate ?? album.publicationDate
        tmp.nbExplicit = song.explicit_content_lyrics ?? 0
        result.push(tmp)
    })

    return result
}

function getSongsByArtist(artist) {
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



function getAllArtistStats(artists) {
    let result = []
    artists.forEach(artist => {
        result = result.concat(getSongsByArtist(artist))
    })

    return result
}

function getAllLanguages(data) {
    let result = []
    data.forEach(artist => {
        if (!result.includes(artist.language)) {
            result.push(artist.language)
        }
    })

    return result
}

function getAllGenres(data) {
    let result = []
    data.forEach(artist => {
        if (!result.includes(artist.genre)) {
            result.push(artist.genre)
        }
    })
    return result
}

function getAllCountry(data) {
    let result = []
    data.forEach(artist => {
        if (!result.includes(artist.country)) {
            result.push(artist.country)
        }
    })
    return result
}

/* FILL COLOR FILTER LIST */
var colorFilter = document.getElementById("colorFilter")

SONG_KEYS.forEach(key => {
    var opt = key;
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    if (key === colorBase) {
        el.selected = true
    }
    colorFilter.appendChild(el);
})



// set the dimensions and margins of the graph
const margin = { top: 30, right: 10, bottom: 10, left: 0 },
    width = (SONG_KEYS.length * 200) - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;





function createParalleleCoordinates(dimensions, data) {
    d3.select("#my_dataviz > *").remove()

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // For each dimension, I build a linear scale. I store all in a y object
    var y = {}
    for (let i in dimensions) {
        var dimName = dimensions[i]
        if ("artist" === dimName && mode === MODE.ALL) {
            y[dimName] = d3.scalePoint()
                .domain(getAllNames(data))
                .range([0, height])
        } else if ("country" === dimName) {
            y[dimName] = d3.scalePoint()
                .domain(getAllCountry(data))
                .range([0, height])
        } else if ("genre" === dimName) {
            y[dimName] = d3.scalePoint()
                .domain(getAllGenres(data))
                .range([0, height])
        } else {
            y[dimName] = d3.scaleLinear()
                .domain(d3.extent(data, function (d) { return +d[dimName]; }))
                .range([height, 0])
        }
    }

    // Build the X scale -> it find the best position for each Y axis
    var x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);
    function setupColorScale() {
        if (y[colorBase].domain()[0] === 0) {
            return d3.scaleSequential().domain(y[colorBase].domain()).interpolator((t) => d3.interpolateSpectral(0 + t));
        } else {
            return d3.scaleOrdinal().domain(y[colorBase].domain()).range(["red", "yellow", "green", "blue"])
        }
    }

    // Create color scale
    const color = setupColorScale() // d3.scaleSequential().domain(y[colorBase].domain()).interpolator((t) => d3.interpolateSpectral(0 + t));

    // Append the lines.
    const line = d3.line()
        .defined(([, value]) => value != null)
        .y(([key, value]) => y[key](value))
        .x(([key]) => x(key));

    // Draw the lines
    const path = svg.append("g")
        .style("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 1)
        .selectAll("path")
        .data(data.slice().sort((a, b) => d3.ascending(a[colorBase], b[colorBase])))
        .enter().append("path")
        .attr("stroke", d => color(d[colorBase]))
        .attr("d", d => line(d3.cross(dimensions, [d], (key, d) => [key, d[key]])))// d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; })))
        // .style("stroke", "#69b3a2")
        .call(path => path.append("title")
            .text(d => d.name))

    // Draw the axis:
    const axes = svg.append("g") // .selectAll("myAxis")
        .selectAll("g")
        // For each dimension of the dataset add a 'g' element:
        .data(dimensions)
        .enter()
        .append("g")
        // Translate this element to its right position on the x axis
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        // Build the axis with the call function
        .each(function (d) { d3.select(this).call(d3.axisLeft(y[d])); })
        .call(g => g.append("text")
            .attr("x", margin.bottom)
            .attr("y", -6)
            .attr("text-anchor", "start")
            .attr("fill", "currentColor")
            .text(d => d))
        .call(g => g.selectAll("text")
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke", "white"));



    // Create the brush behavior.
    const brushWidth = 30;
    const brush = d3.brushY()
        .extent([
            [-(brushWidth / 2), margin.left],
            [brushWidth / 2, width - margin.right]
        ])
        .on("start brush end", brushed);

    axes.call(brush);

    function brushed(key, index) {
        var select = d3.event.selection
        const deselectedColor = "#dddddd";
        if (select === null) {
            selections.delete(key);
        } else if (y[key].invert !== undefined) {
            selections.set(key, select.map(y[key].invert).reverse())
        } else {
            var elemList = _.uniq(data.map(d => d[key]))
            var nbElem = elemList.length
            var hPerElem = height / nbElem
            var bandInf = select[0] / hPerElem
            var bandSup = select[1] / hPerElem
            selections.set(key, [bandInf, bandSup]);
        }

        const selected = [];
        path.each(function (d) {
            const active = Array.from(selections).every(([key, [min, max]]) => {
                var result = false
                if (y[key].invert === undefined) {
                    var eIndex = _.uniq(data.map(d => d[key])).findIndex(e => e === d[key])
                    result = eIndex >= min && eIndex <= max
                } else {
                    result = d[key] >= min && d[key] <= max;
                }

                return result
            });
            d3.select(this).style("stroke", active ? color(d[colorBase]) : deselectedColor);
            if (active) {
                d3.select(this).raise();
                selected.push(d);
            }
        });


        svg.property("value", selected).dispatch("input");
    }


    // viewof selection = Object.assign(svg.property("value", data).node(), { scales: { color } })
}

var few = database.slice(0, 50)

var allSong = getAllArtistStats(few)
createParalleleCoordinates(SONG_KEYS, allSong)

/* EVENT ON COLOR FILTER SELECTION CHANGE */
colorFilter.addEventListener("change", (test) => {
    colorBase = test.target.value
    createParalleleCoordinates(SONG_KEYS, allSong)
})