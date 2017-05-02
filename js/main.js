/**
 * Created by alena on 9/20/2016.
 */

// create global variable for slider
var map, minYear, maxYear, chronSlider;

var dateToYearStr = d3.time.format("%Y");
var yearToDate = dateToYearStr.parse;

queue()
    .defer(d3.json, "data/europe.json")
    .defer(d3.csv, "data/trials.csv")
    .defer(d3.csv, "data/interest.csv")
    .await(createVisualization);

function createVisualization(error, mapData, trialData, interest) {

    if (error != null) {
        alert("Data failed to load properly. Please try again.");
        return
    }

    var europe = mapData.features;

    minYear = d3.min(trialData.map(function(d) {return d.startYear; }));
    maxYear = d3.max(trialData.map(function(d) {return d.endYear; }));

    map = new MapVis("map-area", europe, trialData);

    chronSlider = chroniton()
        .domain([yearToDate(minYear), yearToDate(maxYear)])
        .labelFormat(d3.time.format('%Y'))
        .playButton(true)
        .playbackRate(0.2)
        .width($("#newslider").width())
        .on('change', function(d) { map.wrangleData(dateToYearStr(d)); });

    d3.select("#newslider")
        .append('div')
        .call(chronSlider);

    interest.sort(function (a, b) {
        if (a.year == b.year) {
            return a.location > b.location;
        } else {
            return a.year > b.year;
        }
    });

    addPanels("accordion", interest);

    // COMMENT OUT FOR TROUBLESHOOTING OR ELSE V ANNOYING
    introJs().start();

}

function addPanels(parentID, content) {

    content.forEach(function (d, i) {
        htmlString = '<div class="panel panel-default">\n'
            + '\t<div class="panel-heading">\n'
            + '\t\t<h4 class="panel-title">\n'
            + '\t\t\t<a data-toggle="collapse" data-parent="#accordion" '
            + 'data-year="' + d.year + '"'
            + 'href="#collapse' + i + '"'
            + '>'
            + d.location + ' - ' + d.year
            + '</a>\n'
            + '\t\t</h4>\n'
            + '\t</div>\n'
            + '\t<div id="collapse' + i
            + '" class="panel-collapse collapse" '
            + 'data-location="' + d.location + '" >\n'
            + '\t\t<div class="panel-body">\n\t\t\t'
            + d.content
            + '<small><abbr title="' + d.source + '">Hover for source.</abbr></small>'
            + '\n\t\t</div>\n'
            + '\t</div>\n'
            + '</div>\n';

        document.getElementById(parentID).innerHTML += htmlString;
    });

    allCollapses = $('.collapse');

    $('.panel-title').on('click', function() {
        var link = $('a', this).attr("href");
        var year = $('a', this).attr("data-year");
        allCollapses.collapse('hide');
        $(link).collapse('toggle');
        chronSlider.pause();
        chronSlider.setValue(yearToDate(year), true);
    });

    allCollapses.on('show.bs.collapse', function(){
        map.activeCountry = $(this).attr("data-location");
    });

    allCollapses.on('hide.bs.collapse', function(){
        map.activeCountry = "";
    });

}