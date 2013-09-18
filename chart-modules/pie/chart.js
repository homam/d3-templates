﻿(function() {

  define(['../common/property'], function(Property) {
    return function() {
      var arc, chart, formatNumber, height, legend, margin, nameMap, pie, properties, radius, valueMap, width;
      margin = {
        right: 50
      };
      width = 300;
      height = 300;
      radius = Math.min(width, height) / 2;
      nameMap = function(d) {
        return d.name;
      };
      valueMap = function(d) {
        return d.value;
      };
      legend = true;
      formatNumber = d3.format(',f');
      arc = d3.svg.arc().outerRadius(radius).innerRadius(0);
      pie = d3.layout.pie().sort(null).value(valueMap);
      properties = {
        width: new Property(function(value) {
          width = value - margin.right;
          radius = Math.min(width, height) / 2;
          return arc.outerRadius(radius);
        }),
        height: new Property(function(value) {
          height = value;
          radius = Math.min(width, height) / 2;
          return arc.outerRadius(radius);
        }),
        margin: new Property(function(value) {
          margin = value;
          properties.width.reset();
          return properties.height.reset();
        }),
        names: new Property(function(value) {
          return nameMap = value;
        }),
        colors: new Property,
        values: new Property(function(value) {
          valueMap = value;
          return pie.value(value);
        })
      };
      properties.width.set(width);
      properties.height.set(height);
      chart = function(selection) {
        return selection.each(function(data) {
          var $arc, $arcEnter, $g, $gEnter, $legend, $selection, $svg, color, total;
          color = properties.colors.get() || d3.scale.category10();
          $selection = d3.select(this);
          $svg = $selection.selectAll('svg').data([data]);
          $gEnter = $svg.enter().append('svg').append('g');
          $svg.attr('width', width + margin.right).attr('height', height);
          $g = $svg.select('g').attr('transform', "translate(" + width / 2 + "," + height / 2 + ")");
          $arc = $g.selectAll(".arc").data(pie(data));
          $arcEnter = $arc.enter().append("g");
          $arc.attr("class", function(d) {
            return "arc " + nameMap(d.data);
          });
          $arcEnter.append("path");
          $arc.select('path').transition().duration(500).attr("d", arc);
          $arc.select('path').style("fill", function(d) {
            return color(nameMap(d.data));
          });
          total = $arc.data().reduce(function(a, b) {
            return {
              value: valueMap(a) + valueMap(b)
            };
          });
          $arcEnter.append("text");
          $arc.select('text').attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
          }).attr("dy", ".35em").style("text-anchor", "middle").text(function(d) {
            return formatNumber(valueMap(d.data)) + " (" + (valueMap(d) * 100 / valueMap(total)).toFixed(2).toString() + "%)";
          });
          if (legend) {
            $gEnter.append('g').attr('class', 'legend');
            $legend = $g.select('.legend').attr("transform", "translate(" + (width / 2) + "," + (-height / 2) + ")").attr("class", "legend").attr("width", radius * 2).attr("height", radius * 2).selectAll("g").data(data.map(nameMap)).enter().append("g").attr("transform", function(d, i) {
              return "translate(0," + i * 20 + ")";
            });
            $legend.append("rect").attr("width", 18).attr("height", 18).style("fill", color);
            $legend.append("text").attr("x", 24).attr("y", 9).attr("dy", ".35em").text(function(d) {
              return d;
            });
          }
          return null;
        });
      };
      null;
      chart = Property.expose(chart, properties);
      return chart;
    };
  });

}).call(this);
