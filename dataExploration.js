var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([0, 30])
    .range([0, width]);

var y = d3.scale.linear()
          .domain([1500, 0])
          .range([0, height]);

var color = d3.scale.category20b();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.format("d"))
    .ticks(29);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#space").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
    
var g = svg.append("g")
          .attr('height', height)
          .attr('width', width)
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Initialize before function so broader scope
var places = []; //Contains an element for each street data is collected for
var points = []; //Contains an element for each observation (bikers per day)

d3.json("data.json", function(error, data) {
    var count = 0;
    data.data.forEach(function (day) {
       places.push({
          key: day[9],
          value: [day[13], day[14], day[15], day[16], day[17], day[18], day[19], day[20], day[21], day[22], day[23], day[24], day[25], day[26], day[27], day[28], day[29], day[30], day[31], day[32], day[33], day[34], day[35], day[36], day[37], day[38], day[39], day[40], day[41], day[42]],
          //I know this is repetitive/ not resusable but it is the most direct to get the exact values I needed
          index: count,
          startD: day[10],
          endD: day[11]
       })
       count++; 
    });
    var id = 0;
    for (x = 0; x < places.length; x++) {
       var st = places[x].key;
       var sd = places[x].startD;
       var ed = places[x].endD;
       var num = 0;
       places[x].value.forEach(function (point) {
          points.push({
             bikers: point,
             day: num + 1,
             street: st,
             pt: x,
             ind: id,
             startD: sd,
             endD: ed
          })
          num++;
          id++;
    });
}
  
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Day");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of Riders")



var x = d3.scale.linear() //Called again because couldn't be reached from scope since in function
          .domain([0, 30])
          .range([0, width]);

var y = d3.scale.linear()
          .domain([1500, 0])
          .range([0, height]);

var circles = g.selectAll(".dot")
        .data(points); 

circles.enter().append('circle').attr('class', 'dot') //Plot the points
               .attr("r", 3.5)
               .attr("cx", function(d) { return x(d.day - 1) - 10; })
               .attr("cy", function(d) { return y(d.bikers) - 20; })
               .style("opacity", 0.8)
               .style("fill", function(d) { return color(y(d.pt)); });              

d3.selectAll(".dot").on('mouseover', function(d, index, element) { //Couldn't get text to work so just inserted into HTML
    d3.select(this).attr("r", 10).style("opacity", 1);
    document.getElementById("description").innerHTML = points[index].street + " from " + points[index].startD.substr(0, points[index].startD.indexOf('T'))  + " to " + points[index].endD.substr(0, points[index].endD.indexOf('T')) + "<br>Bikers on this day: " + points[index].bikers;
    document.getElementById("map").innerHTML = "<iframe width='600' height='450' frameborder='0' style='border:0' src='https://www.google.com/maps/embed/v1/place?key=AIzaSyA12dk7SI37zslUk0u1_bckxhbXWZzzPsg&q=" + points[index].street.replace(" ", "+") + ",Seattle+WA' allowfullscreen></iframe>";
});

d3.selectAll(".dot").on('mouseout', function(d, index, element) { //Couldn't get text to work so just inserted into HTML
    d3.select(this).attr("r", 3.5).style("opacity", 0.8);
});

points.forEach(function (point) { //Lines to connect the points we have
  if (point.ind != 1559) {
      if (points[point.ind + 1].bikers != null && point.day < 30) //If there is a point to connect to
         {
            d3.select('svg')
               .append('line')
               .attr({
                  x1: x(point.day),
                  y1: y(point.bikers),
                  x2: x(point.day + 1),
                  y2: y(points[point.ind + 1].bikers),
                  stroke: color(y(point.pt))
            });
         }
      }
  });
});

function filter() { //To update the data on user search

    var query = document.getElementById("input").value;
    g.selectAll(".dot").remove();
    svg.selectAll('line').remove();
    var newPoints = [];
    points.forEach(function (point) {
        if (point.street.toLowerCase().includes(query.toLowerCase().trim())) { //Accept user cases
            newPoints.push(point);
        }
    });

    var circles = g.selectAll(".dot")
          .data(newPoints); 

    circles.enter().append('circle').attr('class', 'dot') //Plot new points
                 .attr("r", 3.5)
                 .attr("cx", function(d) { return x(d.day - 1) - 10; })
                 .attr("cy", function(d) { return y(d.bikers) - 20; })
                 .style("opacity", 0.8)
                 .style("fill", function(d) { return color(y(d.pt)); }); 

    newPoints.forEach(function (point) { //Draw new lines between points
        if (point.ind != 1559) {
           if (points[point.ind + 1].bikers != null && point.day < 30)
           {
              d3.select('svg')
                 .append('line')
                 .attr({
                    x1: x(point.day),
                    y1: y(point.bikers),
                    x2: x(point.day + 1),
                    y2: y(points[point.ind + 1].bikers),
                    stroke: color(y(point.pt))
                 });
           }
        }
     });

    d3.selectAll('circle').on('mouseover', function(d, index, element) { //Since we are now using a new dataset we need to a new way to see individual points
      d3.select(this).attr("r", 10).style("opacity", 1);
      document.getElementById("description").innerHTML = newPoints[index].street + " from " + newPoints[index].startD.substr(0, newPoints[index].startD.indexOf('T'))  + " to " + newPoints[index].endD.substr(0, newPoints[index].endD.indexOf('T')) + "<br>Bikers on this day: " + newPoints[index].bikers;
      document.getElementById("map").innerHTML = "<iframe width='600' height='450' frameborder='0' style='border:0' src='https://www.google.com/maps/embed/v1/place?key=AIzaSyA12dk7SI37zslUk0u1_bckxhbXWZzzPsg&q=" + newPoints[index].street.replace(" ", "+") + ",Seattle+WA' allowfullscreen></iframe>";
    });

    d3.selectAll('circle').on('mouseout', function(d, index, element) { //Couldn't get text to work so just inserted into HTML
    d3.select(this).attr("r", 3.5).style("opacity", 0.8);
});
};