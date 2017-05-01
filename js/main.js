/**
 * Created by alena on 9/20/2016.
 */

// create global variable for slider
var slider = $("#slider")[0];
var map, minYear, maxYear;

queue()
    .defer(d3.json, "data/europe.json")
    .defer(d3.csv, "data/data.csv")
    .await(createVisualization);

function createVisualization(error, mapData, trialData) {

    var europe = mapData.features;

    minYear = d3.min(trialData.map(function(d) {return d.startYear; }));
    maxYear = d3.max(trialData.map(function(d) {return d.endYear; }));

    map = new MapVis("map-area", europe, trialData);

    var dateToYearStr = d3.time.format("%Y");
    var yearToDate = dateToYearStr.parse;

    var chronSlider = chroniton()
        .domain([yearToDate(minYear), yearToDate(maxYear)])
        .labelFormat(d3.time.format('%Y'))
        .playButton(true)
        .playbackRate(0.2)
        .width($("#newslider").width())
        .on('change', function(d) { map.wrangleData(dateToYearStr(d)); });

    d3.select("#newslider")
        .append('div')
        .call(chronSlider);

    introJs().start();

}