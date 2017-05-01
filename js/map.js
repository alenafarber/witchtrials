/**
 * Created by alena on 1/24/2017.
 */


MapVis = function(_parentElement, _map, _trials){
    this.parentElement = "#" + _parentElement;
    this.countries = _map;
    this.trials = _trials;

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

MapVis.prototype.initVis = function(){
    var vis = this;

    vis.containWidth = $(vis.parentElement).width();

    // vis.width = 600,
    vis.width = vis.containWidth,
        vis.height = 500;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.projection = d3.geo.mercator()
        .center([15.2551,54.5260])
        .translate([vis.width/2, vis.height/2])
        .scale(500);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    vis.map = vis.svg.append("g");
    vis.mapCircles = vis.svg.append("g");

    // Render the world by using the path generator
    vis.map.selectAll("path")
        .data(vis.countries)
        .enter().append("path")
        .attr("d", vis.path)
        .attr("class", "country");

    vis.radScale = d3.scale.linear()
        .range([2, 20]);

    // set up tooltip
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0]);

    // insert info into tooltips
    vis.tip.html(function(d) {
        var string = "<strong>Country:</strong> " + d.country
            + "<br><strong>Jurisdiction:</strong> " + d.region
            + "<br><strong>Total Trials:</strong> " + d.trials
            + "<br><strong>Executions:</strong> ";
        if (d.deaths) {
            string += d.deaths;
        } else {
            string += "unknown"
        }
        return string;
    });

    vis.svg.call(vis.tip);

    // legend section
    vis.legendBox = vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(0, " + (vis.height - 230) + ")");

    // vis.legendBox
    //     .append("rect")
    //     .attr("fill", "white")
    //     .attr("width", 100)
    //     .attr("height", 200);

    vis.legend = d3.legend.size()
        .title("Number of Trials")
        .labelFormat(d3.format("1f"))
        .shape('circle')
        .shapePadding(20)
        .labelOffset(5)
        .orient('vertical')
        .ascending(true);

    // vis.legendSvg = d3.select(vis.parentElement + "-legend")
    //     .append("svg")
    //     .attr("width", vis.width)
    //     .attr("height", 100)
    //     .append("g")
    //     .attr("transform", "translate(0, 20)");
    //
    // vis.legend = d3.legend.size()
    //     .title("Number of Trials")
    //     .labelFormat(d3.format("1f"))
    //     .shape('circle')
    //     .shapePadding(10)
    //     .labelOffset(15)
    //     .orient('horizontal')
    //     .ascending(true);

    vis.formatData();
}



/*
 * Data wrangling
 */

MapVis.prototype.formatData = function(){
    var vis = this;

    vis.trials.forEach(function (d) {
        d.deaths = +d.deaths;
        d.trials = +d.trials;
        d.deathsPostAppeal = +d.deathsPostAppeal;
        d.endYear = +d.endYear;
        d.startYear = +d.startYear;
        d.latitude = +d.latitude;
        d.longitude = +d.longitude;
    });

    vis.radScale.domain(d3.extent(vis.trials.map(function(d) { return d.trials; })));

    // Update the visualization
    vis.wrangleData(+minYear);
}


/*
 * Data filtering
 */

MapVis.prototype.wrangleData = function(date){
    var vis = this;

    vis.currYear = date;

    vis.displayData = vis.trials.filter(function(d) {
        return (d.startYear <= vis.currYear) && (d.endYear >= vis.currYear);
    });

    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

MapVis.prototype.updateVis = function(){
    var vis = this;

    vis.legend
        .scale(vis.radScale);

    vis.legendBox.call(vis.legend);

    vis.circles = vis.mapCircles.selectAll(".node")
        .data(vis.displayData, function(d) {return d.region});

    vis.circles.enter()
        .append("circle")
        .attr("class", "node");

    vis.circles
        .attr("transform", function(d) {
            return "translate(" + vis.projection([d.longitude, d.latitude]) + ")";
        })
        .attr("fill", "red")
        .attr("stroke", "black")
        .attr("fill-opacity", 0.4)
        .attr("stroke-width", 0.5)
        .on("mouseover", vis.tip.show)
        .on("mouseout", vis.tip.hide)
        .transition().duration(200).attr("r", function(d) { return vis.radScale(d.trials); });

    vis.circles.exit().transition().duration(200).attr("r", 0).remove();

}