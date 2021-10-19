/* set dimensions and margins of the graph */
const margin = { top:100, right:30, bottom:60, left:70},
       width = 500, height = 480;


/* append svg object to the body of the page */
const svg = d3.select("#dataViz")
            .append("svg")
            .attr("width", 600)
            .attr("height", 600)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);


/* Labels of row and columns */
const years = ["1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthDict = {1:"January", 2:"February", 3:"March", 4:"April", 5:"May", 6:"June",
                    7:"July", 8:"August", 9:"September", 10:"October", 11:"November", 12:"December"};

/* build X scales and axis */
const x = d3.scaleBand().range([0, width]).domain(years).padding(0.05);
svg.append("g").call(d3.axisTop(x));
/* build Y scales and axis */
const y = d3.scaleBand().range([height,0]).domain(months).padding(0.05);
svg.append("g").call(d3.axisLeft(y));


/* build color scale */
const myColor = d3.scaleLinear().domain([3, 24, 32, 38]).range(["#FFFFDF", "#FFB400", "#FF3232", "#A01450"]);

// create a tooltip
let tooltip = d3.select("#dataViz")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("position", "absolute")


// Three function that change the tooltip when user hover / move / leave a cell
const mouseOver = function(event, d) {
    tooltip.style("opacity", 1)
    d3.select(this).style("stroke", "black")
}
const mouseMove = function(event, d) {
    // tooltip.html("min temperature: " + d.minTpr)
    tooltip.html("Data: " + d.yy + "-" + d.mm + ";<br>max: " + d.maxTpr + "; min: " + d.minTpr)
           .style("left", (event.x-80) + "px")
           .style("top",  (event.y-120) + "px");
}
const mouseLeave = function(evernt, d) {
    tooltip.style("opacity", 0)
    d3.select(this).style("stroke", "none")
}


/* read data */
let newData = [], dataLength;
d3.csv("temperature_daily.csv").then(function(csvData) {

    dataLength = csvData.length;
    /* base variable */
    let monthMin = Infinity,  monthMax = -Infinity,
        year = 1997,  month = 1;

    /* fill matrix with csvdata */
    let i = 0;
    while(i < dataLength){
        dateArr = csvData[i].date.split('/');   //year/month/day
        let y = parseInt(dateArr[0]);
        if ( y==year ){
            let m = parseInt(dateArr[1]);
            if ( m==month ){
                monthMin = Math.min(monthMin, csvData[i].min_temperature);
                monthMax = Math.max(monthMax, csvData[i].max_temperature);
            }
            else{
                newData.push({yy: year, mm: monthDict[month], maxTpr: monthMax, minTpr: monthMin});
                month = month + 1;
                monthMin = Infinity;
                monthMax = -Infinity;
            }
        }
        else{
            newData.push({yy: year, mm: monthDict[month], maxTpr: monthMax, minTpr: monthMin});
            year = year+1;
            month = 1;
            monthMin = Infinity;
            monthMax = -Infinity;
        }
        i = i + 1;
    }
    newData.push({yy: year, mm: monthDict[month], maxTpr: monthMax, minTpr: monthMin});

    svg.selectAll()
        .data(newData, function(d){ return d.yy + ":" + d.mm;})
        .enter()
        .append("rect")
        .attr("x", function(d){ return x(d.yy); })
        .attr("y", function(d){ return y(d.mm); })
        .attr("width",  x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d){ return myColor(d.maxTpr) })
        .style("stroke-width", 2)
        .style("stroke", "none")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave)

});



// Function that change temperature mode when user click SWITCH button
const mode = ["MIN temperature", "MAX temperature"];
let flag = 0;
const mouseClick = function(d){
    if(flag>1){
        flag = 0;
    }
    document.getElementById("assistence").value = mode[flag];
    if(flag){
        svg.selectAll()
            .data(newData, function(d){ return d.yy + ":" + d.mm;})
            .enter()
            .append("rect")
            .attr("x", function(d){ return x(d.yy); })
            .attr("y", function(d){ return y(d.mm); })
            .attr("width",  x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d){ return myColor(d.maxTpr) })
            .style("stroke-width", 2)
            .style("stroke", "none")
            .on("mouseover", mouseOver)
            .on("mousemove", mouseMove)
            .on("mouseleave", mouseLeave)
    }
    else{
        svg.selectAll()
        .data(newData, function(d){ return d.yy + ":" + d.mm;})
        .enter()
        .append("rect")
        .attr("x", function(d){ return x(d.yy); })
        .attr("y", function(d){ return y(d.mm); })
        .attr("width",  x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d){ return myColor(d.minTpr) })
        .style("stroke-width", 2)
        .style("stroke", "none")
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave)
    }
    flag = flag + 1;
}


console.log("***  Come on! Don't give it up! ***");
    