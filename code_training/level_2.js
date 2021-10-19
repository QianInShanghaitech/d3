/* set dimensions and margins of the graph */
const margin = { top:50, right:30, bottom:30, left:70},
       width = 500, height = 480;


/* create svg object to the body of the page */
const svgHeat = d3.select("#dataViz")
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
// const days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

/* build X & Y scales and axis */
const x = d3.scaleBand().range([0, width]).domain(years).padding(0.05);
svgHeat.append("g").call(d3.axisTop(x));
const y = d3.scaleBand().range([height,0]).domain(months).padding(0.05);
svgHeat.append("g").call(d3.axisLeft(y));
/* build color scale */
const heatColor = d3.scaleLinear().domain([3, 24, 32, 38]).range(["#FFFFDF", "#FFB400", "#FF3232", "#A01450"]);

// create a tooltip
let tooltip = d3.select("#dataViz")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid").style("border-width", "2px").style("border-radius", "5px")
                .style("padding", "5px")
                .style("position", "absolute")

// Three function that change the tooltip when user hover / move / leave a cell
const mouseOver = function(event, d) {
    tooltip.style("opacity", 1)
    d3.select(this).style("stroke", "black")
}
const mouseMove = function(event, d) {
    tooltip.html("Data: " + d.yy + "-" + d.mm + ";<br>max: " + d.maxTpr + "; min: " + d.minTpr)
           .style("left", (event.x-80) + "px")
           .style("top",  (event.y-120) + "px");
}
const mouseLeave = function(evernt, d) {
    tooltip.style("opacity", 0);
    d3.select(this).style("stroke", "none");
}


/* set line colors */
const lineColor = ["#1E90FF", "#32CD32"] // blue & green
/* construct data accessor */
let lineAccMin = d3.line().x( function(d){ return d.day} )
                        .y( function(d){ return d.mint} )
let lineAccMax = d3.line().x( function(d){ return d.day} )
                        .y( function(d){ return d.maxt} )

/* a helper function to draw lines and rect */
const drawRectLine = function(mode){
    /* append heatmap */
    if (mode){
        svgHeat.selectAll()
            .data(newData, function(d){ return d.yy + ":" + d.mm })     // bond array
            .enter()
            .append("rect")
            .attr("x", function(d){ return x(d.yy) })
            .attr("y", function(d){ return y(d.mm) })
            .attr("width",  x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d){ return heatColor(d.maxTpr) })
            .style("stroke-width", 2)
            .on("mouseover", mouseOver)
            .on("mousemove", mouseMove)
            .on("mouseleave", mouseLeave)
    }
    else{
        svgHeat.selectAll()
            .data(newData, function(d){ return d.yy + ":" + d.mm })     // bond array
            .enter()
            .append("rect")
            .attr("x", function(d){ return x(d.yy) })
            .attr("y", function(d){ return y(d.mm) })
            .attr("width",  x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d){ return heatColor(d.minTpr) })
            .style("stroke-width", 2)
            .on("mouseover", mouseOver)
            .on("mousemove", mouseMove)
            .on("mouseleave", mouseLeave)
    }
    
    /** append min-line chart */
    svgHeat.selectAll()
        .data(newData, function(d){ return d.yy + ":" + d.mm })     // bond array
        .enter()
        .append("path")
        .attr('transform', d=>`translate(${x(d.yy)+8},${y(d.mm)})`) 
        // .attr("x", function(d){ return x(d.yy) })
        // .attr("y", function(d){ return y(d.mm) })
        .attr("width",  x.bandwidth() ).attr("height", y.bandwidth() )
        .attr("fill", "none")
        .attr("stroke", lineColor[0])
        .attr("stroke-width", 1.5)
        .attr("d", d => lineAccMin(d.daily) )
    /** append max-line chart */
    svgHeat.selectAll()
        .data(newData, function(d){ return d.yy + ":" + d.mm })     // bond array
        .enter()
        .append("path")
        .attr('transform', d=>`translate(${x(d.yy)+8},${y(d.mm)-2})`) 
        .attr("width",  x.bandwidth() ).attr("height", y.bandwidth() )
        .attr("fill", "none")
        .attr("stroke", lineColor[1])
        .attr("stroke-width", 1.5)
        .attr("d", d => lineAccMax(d.daily) )
}

/* read data */
let newData = [], dataLength;
d3.csv("temperature_daily.csv").then( function(csvData){

    dataLength = csvData.length;
    let monthMin = Infinity,  monthMax = -Infinity, year = 1997,  month = 1;
    let daily = [], i=0;
    while( i < dataLength ){
        dateArr = csvData[i].date.split('/');   // year/month/day
        let y = Number(dateArr[0]);
        if( y == year ){
            let m = Number(dateArr[1]);
            if ( m == month )
            {
                monthMin = Math.min(monthMin, Number(csvData[i].min_temperature) );
                monthMax = Math.max(monthMax, Number(csvData[i].max_temperature) );
                daily.push( { day:Number(dateArr[2]),  mint:Number(csvData[i].min_temperature),  maxt:Number(csvData[i].max_temperature)} );
            }
            else{
                newData.push( { yy:year, mm:monthDict[month], maxTpr:monthMax, minTpr:monthMin, daily } );
                month = month + 1; 
                monthMin = Infinity;
                monthMax = -Infinity;
                daily = [];
                daily.push( { day:Number(dateArr[2]),  mint:Number(csvData[i].min_temperature),  maxt:Number(csvData[i].max_temperature)} );
            }
        }
        else{
            newData.push( { yy:year, mm:monthDict[month], maxTpr:monthMax, minTpr:monthMin, daily } );
            year = year + 1;
            month = 1;
            monthMin = Infinity;
            monthMax = -Infinity;
            daily = [];
            daily.push( { day:Number(dateArr[2]),  mint:Number(csvData[i].min_temperature),  maxt:Number(csvData[i].max_temperature)} );
        }
        i = i + 1;
    }
    newData.push( { yy:year, mm:monthDict[month], maxTpr:monthMax, minTpr:monthMin, daily } );
    drawRectLine(1);

})


// Function that change temperature mode when user click SWITCH button
const mode = ["MIN temperature", "MAX temperature"];
let flag = 0;
const mouseClick = function(d){
    if(flag>1){
        flag = 0;
    }
    document.getElementsByTagName("h2")[0].innerHTML = mode[flag];
    drawRectLine(flag);
    flag = flag + 1;
}

console.log("*** come on ！ ***");


