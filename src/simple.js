import { getAllArtists, getAllArtistsTmp } from './wasabi.js'
import { getAllArtistStats, getAllNames, getAllCountry, getAllGenres } from './utils.js'

var database = await getAllArtistsTmp();

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