import { getAllArtists, getAllArtistsTmp } from './wasabi.js'

var database = await getAllArtistsTmp();

const CURRENT_YEAR = new Date().getFullYear()

const SONG_KEYS = ["artist", "country", "age", "language", "bpm", "genre", "releaseDate", "nbExplicit"]

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
    return artist.lifeSpan?.begin === "" ? 0 : (artist.lifeSpan?.ended ? artist.lifeSpan?.end : CURRENT_YEAR) - artist.lifeSpan?.begin
}

function getCountry(artist) {
    return artist.location?.country ?? "UNKNOWN"
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
    let genre = getGenres(artist)

    artist.albums.forEach(album => {
        album.songs.forEach(song => {
            let finalGenre = song.genre ?? genre ?? ["UNKNOWN"]

            result = result.concat(createSongInfos(artist, album, song, finalGenre))
        })
    })

    return result
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

function getAllSongs(artists) {
    let result = []
    artists.forEach(artist => {
        getSongsByArtist(artist)
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



/* FILL ARTIST LIST */
var select = document.getElementById("selectArtist")
var options = getAllNames(database);

for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
}

/* FILL COLOR FILTER LIST */
var select = document.getElementById("colorFilter")

SONG_KEYS.forEach(key => {
    var opt = key;
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
})

/* EVENT ON ARTIST SELECTION CHANGE */
select.addEventListener("change", () => {
    console.log(select.value)
    testArtist(getArtistByName(select.value))
})

// set the dimensions and margins of the graph
const margin = { top: 30, right: 10, bottom: 10, left: 0 },
    width = (SONG_KEYS.length * 200) - margin.left - margin.right,
    height = /*30*/800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");



function createParalleleCoordinates(dimensions, data) {
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
        } else if ("language" === dimName) {
            y[dimName] = d3.scalePoint()
                .domain(getAllLanguages(data))
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

    // Create color scale
    const color = d3.scaleOrdinal(d3["schemeSet1"])
        .domain(y[colorBase].domain());
    //d3.scaleSequential(y[colorBase].domain(), (t) => [d3.interpolateBrBG(1 - t)]);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function createPath(d) {
        return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw the lines
    const path = svg.selectAll("myPath")
        .data(data.slice().sort((a, b) => d3.ascending(a[colorBase], b[colorBase])))
        // .attr("stroke", d => color(d[colorBase]))
        .enter().append("path")
        .attr("stroke", d => color(d[colorBase]))
        .attr("d", createPath)
        .style("fill", "none")
        //.attr("stroke", d => color(d[colorBase]))
        // .style("stroke", "#69b3a2")
        .style("opacity", 0.5)
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
        // Add axis title
        // .append("text")
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
    // .style("text-anchor", "middle")
    // .attr("y", -9)
    // .text(function (d) { return d; })
    // .style("fill", "black")

    // Create the brush behavior.
    const brushWidth = 50;
    const brush = d3.brushY()
        .extent([
            [-(brushWidth / 2), margin.left],
            [brushWidth / 2, width - margin.right]
        ])
        .on("start brush end", brushed);

    axes.call(brush);
    console.log(axes)

    function brushed(test, key) {
        console.log(test)
        const deselectedColor = "#ddd";
        if (selection === null) selections.delete(key);
        else selections.set(key, selection.map(x.get(key).invert));
        const selected = [];
        path.each(function (d) {
            const active = Array.from(selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
            d3.select(this).style("stroke", active ? color(d[keyz]) : deselectedColor);
            if (active) {
                d3.select(this).raise();
                selected.push(d);
            }
        });
        svg.property("value", selected).dispatch("input");
    }
}

var few = database.slice(0, 50)

var allSong = getAllSongs(few)

createParalleleCoordinates(SONG_KEYS, allSong)