let dataLength;

/* initialize matrix to be visualization*/
let tprArr = new Array(2017-1997+1);
for(let j=0; j<2006-1997+1; j++){
    tprArr[j] = new Array(12);
}

d3.csv("temperature_daily.csv").then(function(csvData) {
    // console.log(csvData.length);
    dataLength = csvData.length;
    /* base variable */
    let monthMin = Infinity,
        monthMax = -Infinity,
        year = 1997, 
        month = 1;

    /* fill matrix with csvdata */
    let i = 0;
    while(i < dataLength){
        dateArr = csvData[i].date.split('/');   //year/month/day
        if ( dateArr[0]==year ){
            if ( dateArr[1]==month ){
                monthMin = Math.min(monthMin, csvData[i].min_temperature);
                monthMax = Math.max(monthMax, csvData[i].max_temperature);
            }
            else{
                // tprArr[year-1997][month-1] = [monthMin, monthMax];
                tprArr[year-1997][month-1] = {min: monthMin, max: monthMax};
                month = month + 1;
                monthMin = Infinity;
                monthMax = -Infinity;
            }
        }
        else{
            year = year+1;
            month = 1;
            console.log(year);
        }
        i = i + 1;
    }
});

// const csvData = d3.csv("temperature_daily.csv").then(aggregation(Data));


// aggregation(csvData);
console.log(tprArr);