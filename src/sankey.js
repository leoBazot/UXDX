var margin = { top: 80, right: 100, bottom: 120, left: 100 },
    width = 1500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#my_dataviz_sankey")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var color = d3.scaleOrdinal(d3.schemeCategory10);

var sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(20)
    .size([width, height]);

// Récupération des données JSON
d3.json("./data2.json").then(function (graph) {

    sankey.nodes(graph.nodes)
        .links(graph.links)
        .layout(1);

    var link = svg.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", sankey.link())
        .style("stroke", function (d) {
            return d.color = color(d.source.name);
        })
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function (a, b) { return b.dy - a.dy; });

    link.append("title")
        .text(function (d) { return d.source.name + " → " + d.target.name + "\n" + d.value; });


    var node = svg.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
            .subject(function (d) { return d; })
            .on("start", function () { this.parentNode.appendChild(this); })
            .on("drag", dragmove));

    node.append("rect")
        .attr("height", function (d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) { return d.color = color(d.name.replace(/ .*/, "")); })
        .append("title")
        .text(function (d) { return d.group + " : " + d.name; });

    node.append("text")
        .attr("x", -6)
        .attr("y", function (d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) { return d.name; })
        .filter(function (d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // Déplacer les nœuds
    function dragmove(d) {
        d3.select(this)
            .attr("transform",
                "translate("
                + (d.x = Math.max(
                        0, Math.min(width - d.dx, d3.event.x))
                ) + ","
                + (d.y = Math.max(
                        0, Math.min(height - d.dy, d3.event.y))
                ) + ")");
        sankey.relayout();
        link.attr("d", sankey.link());
    }

    var cols_x = sankey.nodes().map(d => d.x).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
    var labels = ["Sexe", "Genre musique", "Fans Deezer","BPM", "Duree vie (année)"]; // Définissez vos étiquettes ici
    cols_x.forEach((d, i) => {
        svg.append("text")
            .attr("x", d)
            .attr("y", -22)
            .text(labels[i]);
    });

// Update le sankey
    function updateSankey(data) {
        sankey
            .nodes(data.nodes)
            .links(data.links)
            .layout(1);

        var nodes = svg.selectAll(".node")
            .data(data.nodes, function(d) { return d.id; });

        var newNode = nodes.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .call(d3.drag() // Ajoute la fonction de drag-and-drop aux nouveaux nœuds
                .subject(function(d) { return d; })
                .on("start", function() { this.parentNode.appendChild(this); })
                .on("drag", dragmove));

        newNode.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
            .append("title")
            .text(function(d) { return d.group + " : " + d.name; });

        newNode.append("text")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        nodes.exit().remove();

        var links = svg.selectAll(".link")
            .data(data.links);

        links.enter().append("path")
            .attr("class", "link")
            .merge(links)
            .attr("d", sankey.link())
            .style("stroke", function(d) { return d.color = color(d.source.name); })
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; });

        links.exit().remove();

        // Déplacer les noeuds
        function dragmove(d) {
            d3.select(this)
                .attr("transform", "translate("
                    + (d.x = Math.max(0, Math.min(width - d.dx, d3.event.x)))
                    + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y)))
                    + ")");
            sankey.relayout();
            links.attr("d", sankey.link());
        }
    }

    // Supprimer une colonne
    function deleteColumn(elem) {
        graph.nodes = graph.nodes.filter(function(node) {
            return node.group !== elem;
        });

        graph.links = graph.links.filter(function(link) {
            return link.source.group !== elem && link.target.group !== elem;
        });

        updateSankey(graph);
    }

    //deleteColumn("BPM")

}).catch(error => {
            console.log("Fetch error");
            console.log(error);
        });




