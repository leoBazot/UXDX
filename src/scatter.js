import { getAllArtists, getAllArtistsTmp } from './wasabi.js'
import { getAllArtistStats, getAllNames, getAllCountry, getAllGenres } from './utils.js'

var database = await getAllArtistsTmp();

const SONG_KEYS = ["artist", "country", "age", "genre", "nbExplicit", "deezerFans"]
var few = database.slice(0, 50)
var donnees = getAllArtistStats(few)

/*// Tableau de données obtenu sur les données AirBnB
donnees = [{
    type: "Entire home/apt",
    count: 35185,
    price: 106,
    estMort: false
  },
  {
    type: "Private room",
    count: 5827,
    price: 56,
    estMort: true
  },
  {
    type: "Shared room",
    count: 464,
    price: 40
  }
  ];*/
  
  // Définition des marges et de la taille du graphique
  var marges = {
    haut: 20,
    droit: 20,
    bas: 30,
    gauche: 40
  }
  var largeurTotale = 1500
  var hauteurTotale = 300
  var largeurInterne = largeurTotale - marges.gauche - marges.droit
  var hauteurInterne = hauteurTotale - marges.haut - marges.bas;
  
  var chpCat = ["artist", "country", "genre"];
  // Echelles pour l'axe Y
  var echellesY = {};
  for (var cle in SONG_KEYS) {
      if (chpCat.includes(SONG_KEYS[cle])){
        let poss = donnees.map(function(d){
        return d[SONG_KEYS[cle]];
      })
        echellesY[SONG_KEYS[cle]] = d3.scalePoint()
        .domain(poss)
        .range([0, hauteurInterne])
        .padding(0.2);
      
    }
    else {
      let max = d3.max(donnees, function(d) {
          return d[SONG_KEYS[cle]];
      });
      echellesY[SONG_KEYS[cle]] = d3.scaleLinear()
          .domain([0, max+10])
          .range([hauteurInterne, 0]);
    }
    
  }
  
  // Echelle pour le type sur l'axe X
  var echellesX = {};
  for (var cle in SONG_KEYS) {
      if (chpCat.includes(SONG_KEYS[cle])){
        let poss = donnees.map(function(d){
        return d[SONG_KEYS[cle]];
      })
        echellesX[SONG_KEYS[cle]] = d3.scalePoint()
        .domain(poss)
        .range([0, largeurInterne])
        .padding(0.2);
      
    }
    else {
      let max = d3.max(donnees, function(d) {
          return d[SONG_KEYS[cle]];
      });
      echellesX[SONG_KEYS[cle]] = d3.scaleLinear()
          .domain([0, max+10])
          .range([0, largeurInterne]);
    }
    
  }
  var variableX = "genre";
  var variableY = "deezerFans";
  
  // Création de l'axe X
  var axeX = d3.axisBottom().scale(echellesX[variableX]);
  
  // Création de l'axe Y
  //par défaut on affiche les prix
  var axeY = d3.axisLeft().scale(echellesY[variableY]);
  
  // Création du graphique
  var graphique = d3.select("#scatter").append("svg")
    .attr("width", largeurTotale)
    .attr("height", hauteurTotale)
    .append("g")
    .attr("transform", "translate(" + marges.gauche + "," + marges.haut + ")")
    .attr("id", "repres")
    .attr("transform", "translate(60, 10)");
  
  // Add a clipPath: everything out of this area won't be drawn.
  var clip = graphique.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", largeurInterne )
    .attr("height", hauteurInterne )
    .attr("x", 0)
    .attr("y", 0);
  
  // Ajout de l'axe X au graphique
  graphique.append("g")
    .attr("class", "majAxisX")
    //.attr("clip-path", "url(#clip)")
    .attr("style", "background-color:#33475b");
    
  graphique.select(".majAxisX")
    .append("g")
    .attr("class", "x axis currentAxis type")
    .attr("transform", "translate(0," + hauteurInterne + ")")
    .call(axeX);
  
  // Ajout de l'axe Y au graphique
  graphique.append("g")
  .attr("class", "majAxisY")
  .attr("style", "background-color:#33475b");
  
  graphique.select(".majAxisY")
  .append("g")
  .attr("class", "y axis currentAxis price")
  .attr("height", hauteurInterne / 2)
  .call(axeY);
  
  graphique.select(".y.axis").select("path").attr("class", "majAxisY");
  
  graphique.select(".majAxisY")
  .append("text")
  .attr("class", "currentAxis")
  .attr("transform", "rotate(-90)")
  .attr("y", 5)
  .attr("dy", "-3.2em")
  .style("text-anchor", "end")
  .text(variableY);
  
  graphique.select(".majAxisX")
  .append("text")
  .attr("class", "currentAxis")
  .attr("transform", "translate(330,330)")
  .attr("dy", "-3.2em")
  .style("text-anchor", "end")
  .text(variableX);
  
  // Ajout d'une barre pour chaque type de logement, avec une taille fonction du prix moyen
  var dots = graphique.selectAll("dots")
  .data(donnees)
  .join("circle")
      .attr("cx", function (d) { return echellesX[variableX](d[variableX]); } )
    .attr("cy", function (d) { return echellesY[variableY](d[variableY]); } )
    .attr("r", 3)
    .style("fill", "#69b3a2");
  /* .enter()
  .append("path") */
      //.attr('transform',function(d){ return "translate("+echellesX["type"](d.type)+","+echellesY["price"](d.price)+")"; })
    
  // Add brushing
  var brush = d3.brushX()
    .extent( [ [0,0], [largeurInterne,hauteurInterne] ] )
    .on("end", zoom)
  graphique.append("g")
    .attr("class", "brush")
    .call(brush);
  // A function that set idleTimeOut to null
  var idleTimeout
  function idled() { idleTimeout = null; }
  
  /*dots.attr("d", symbol.type(function(d){
      if(d.estMort){ 
        return d3.symbolCross
      } else {
        return d3.symbolCircle
      }
  })) */
  
  //creation of graphic movement animations
  //Y axis related movements
  var div1 = d3.selectAll(".majAxisY");
  var largeurMax = Object.keys(echellesY).length*50+40;
  var startTranslateState = 'translate(60px,10px)';
  var endTranslateStateY = 'translate('+largeurMax+'px,10px)';
  var translateInterpolatorInY = d3.interpolateString(startTranslateState, endTranslateStateY);
  var translateInterpolatorOutY = d3.interpolateString(endTranslateStateY, startTranslateState);
  var enteredY = false; //used to prevent blinking axis
  
  //X axis related movements
  var div2 = d3.selectAll(".majAxisX");
  var hauteurMax = Object.keys(echellesX).length*50+10;
  var endTranslateStateX = 'translate(60px,'+hauteurMax+'px)';
  var translateInterpolatorInX = d3.interpolateString(startTranslateState, endTranslateStateX);
  var translateInterpolatorOutX = d3.interpolateString(endTranslateStateX, startTranslateState);
  var enteredX = false; //same than above for X axis
  
  // A function that update the chart for given boundaries
  function zoom() {
    let extent = d3.event.selection;
    let elemList
    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
      if (chpCat.includes(variableX)){
          elemList = donnees.map(d => d[variableX]);
        //echellesX[variableX].domain(elemList)
      } else {
          /*echellesX[variableX].domain([ 0,d3.max(donnees, function(d) {
            return d[variableX];
        })]);*/
        elemList = [ 0,d3.max(donnees, function(d) {
            return d[variableX];
        })];
      }
    }else{
      if (chpCat.includes(variableX)){
        var poss = donnees.map(d => d[variableX]);
        var nbElem = poss.length;
        var wPerElem = largeurInterne / nbElem;
        var bandInf = Math.round(extent[0] / wPerElem);
        var bandSup = Math.round(extent[1] / wPerElem);
        elemList = poss.slice(bandInf, bandSup);
        echellesX[variableX].domain(elemList);
      } else {
          elemList = [ echellesX[variableX].invert(extent[0]), echellesX[variableX].invert(extent[1]) ];
        echellesX[variableX].domain([ echellesX[variableX].invert(extent[0]), echellesX[variableX].invert(extent[1]) ]);
      }
      
    }
    //graphique.select(".brush").call(brush.move, null)
    var circ = d3.selectAll("circle").data(donnees);
    circ.exit().remove();
    circ.enter()
      .append("path")
      .merge(circ)
      .transition()
      .duration(1000)
      .attr("cx", function(d) {
        return echellesX[variableX].domain(elemList)(d[variableX]);
      })
      .attr("cy", function(d) {
        return echellesY[variableY](d[variableY]);
      })
      //.attr('transform',function(d){ return "translate("+echellesX[variableX](d[variableX])+","+echellesY[variableY](d[variableY])+")"; }); 
     d3.select(".majAxisX .currentAxis")
      .transition()
      .duration(1000)
      .call(d3.axisBottom(echellesX[variableX]))
  
  }
  
  function updateData(xobj, yobj) {
  if (xobj == variableX){
    d3.selectAll(".majAxisY .currentAxis").remove();
    d3.selectAll(".majAxisY ."+yobj)
      .attr("transform", "translate(0, 0)")
      .classed("axeSupp", false)
      .attr("class", "currentAxis "+yobj);
    d3.select(".majAxisY").selectAll("text."+yobj)
      .attr("transform", "rotate(-90)")
      .attr("y", 5);
    variableY = yobj;
  }
  else {
      d3.selectAll(".majAxisX .currentAxis").remove();
    d3.selectAll(".majAxisX ."+xobj)
      .attr("transform", "translate(0, 250)")
      .classed("axeSupp", false)
      .attr("class", "currentAxis "+xobj);
    d3.select(".majAxisX").select("text."+xobj)
      .attr("transform", "translate(330, 330)");
    variableX = xobj;
  }
  
  d3.selectAll(".axeSupp").remove();
  var circ = d3.selectAll("circle")
    .data(donnees);
  circ.exit().remove();
  circ.enter()
    .append("circle")
    .merge(circ)
    .transition()
    .duration(1000)
    .attr("cx", function(d) {
      return echellesX[xobj](d[xobj]);
    })
    .attr("cy", function(d) {
      return echellesY[yobj](d[yobj]);
    })
    .attr("height", function(d) {
      return hauteurInterne - echellesY[yobj](d[yobj]);
    })
    .attr("fill", "#69b3a2");
  }
  
  function expandDivY() {
    if (!enteredY) {
  
      let decalage = 1;
      for (let attribut in echellesY){
        if (!d3.select(".majAxisY .currentAxis").classed(attribut)){
          var axeYBis = d3.axisLeft().scale(echellesY[attribut]);
          graphique.select(".majAxisY")
            .append("g")
            .attr("class", "y axis axeSupp "+attribut)
            .call(axeYBis)
            .attr("transform", "translate("+decalage*(-60)+", 0)")
            .on("click", function() {
              updateData(variableX, attribut);
            });
          graphique.select(".majAxisY").append("text")
            .attr("transform", "rotate(-90)")
            .attr("class", "axeSupp "+attribut)
            .attr("y", decalage*(-55))
            .attr("dy", "-3.2em")
            .style("text-anchor", "end")
            .text(attribut)
            .on("click", function() {
              updateData(variableX, attribut);
          });
          d3.select(".majAxisY .type")
            .selectAll("text")
            .attr("transform", "rotate(-60)");
          d3.select("#scatter svg").attr("width", 500+decalage*100);
          d3.select("#repres")
            .transition()
            .duration(1000)
            .styleTween('transform', function(d) {
            return translateInterpolatorInY;
          });
          decalage++;
        }
      }
      enteredY = true;
    }
  }
  
  function shrinkDivY() {
  d3.selectAll(".axeSupp").remove();
  d3.select("#repres")
    .transition()
    .duration(700)
    .styleTween('transform', function(d) {
      return translateInterpolatorOutY;
    });
  d3.select("#scatter")
    .transition()
    .duration(700)
    .attr("width", largeurTotale);
  enteredY = false;
  enteredX = false;
  }
  
  //manage X axis expand and shrink
  function expandDivX() {
    if (!enteredX) {
      let decalage = 1;
      for (let attribut in echellesX){
        if (!d3.select(".majAxisX .currentAxis").classed(attribut)){
          var axeXBis = d3.axisBottom().scale(echellesX[attribut]);
          let transY = 250+decalage*35;
          graphique.select(".majAxisX")
            .append("g")
            .attr("class", "x axis axeSupp "+attribut)
            .call(axeXBis)
            .attr("transform", "translate(0, "+transY+")")
            .on("click", function() {
              updateData(attribut, variableY);
          });
          transY = 330+decalage*35;
          graphique.select(".majAxisX")
            .append("text")
            .attr("class", "axeSupp "+attribut)
            .attr("transform", "translate(330,"+transY+")")
            .attr("dy", "-3.2em")
            .style("text-anchor", "end")
            .text(attribut)
            .on("click", function() {
              updateData(attribut, variableY);
            });
          d3.select("#scatter svg").attr("height", 300+decalage*40);
          d3.select("#repres")
            .transition()
            .duration(1000);
          decalage++;
        }
      }
        enteredX = true;
    }
  }
  
  function shrinkDivX() {
  d3.selectAll(".axeSupp").remove();
  d3.select("#repres")
    .transition()
    .duration(700);
  d3.select("#scatter")
    .transition()
    .duration(700)
    .attr("height", hauteurTotale);
  enteredX = false;
  enteredY = false;
  }
  
  
  var delayInOut = function(elem, incb, outcb) {
  var timeout = null;
  var clearto = function() {
    clearTimeout(timeout);
    timeout = null;
  };
  elem.on("mouseenter", function() {
    clearto();
    timeout = setTimeout(incb, 500);
  })
  elem.on("mouseleave", function() {
    clearto();
    timeout = setTimeout(outcb, 2500);
  })
  }
  delayInOut(div1, expandDivY, shrinkDivY);
  delayInOut(div2, expandDivX, shrinkDivX);