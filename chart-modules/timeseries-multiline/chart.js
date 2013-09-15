// Generated by CoffeeScript 1.6.2
(function() {
  define(['../common/property'], function(Property) {
    return function() {
      var chart, dispatch, height, margin, properties, width, x, xAxis, y, yAxis;

      margin = {
        top: 20,
        right: 40,
        bottom: 20,
        left: 50
      };
      width = 720;
      height = 300;
      x = d3.time.scale();
      y = d3.scale.linear();
      xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(d3.time.format("%b %d"));
      yAxis = d3.svg.axis().scale(y).orient('left');
      properties = {
        width: new Property(function(value) {
          width = value - margin.left - margin.right;
          x.range([0, width]);
          xAxis.scale(x);
          return yAxis.tickSize(-width, 0, 0);
        }),
        height: new Property(function(value) {
          height = value - margin.top - margin.bottom;
          xAxis.tickSize(-height, 0, 0);
          return y.range([height, 0]);
        }),
        margin: new Property(function(value) {
          margin = _.extend(margin, value);
          properties.width.reset();
          return properties.height.reset();
        }),
        x: new Property,
        y: new Property,
        values: new Property,
        key: new Property,
        keyFilter: new Property,
        transitionDuration: new Property,
        tooltip: new Property
      };
      properties.width.set(width);
      properties.height.set(height);
      properties.transitionDuration.set(500);
      properties.keyFilter.set(function() {
        return true;
      });
      dispatch = d3.dispatch('mouseover', 'mouseout', 'mousemove');
      chart = function(selection) {
        return selection.each(function(raw) {
          var $g, $gEnter, $line, $selection, $svg, $xAxis, $yAxis, data, keyFilter, keyMap, keys, layers, line, scaleLayers, transitionDuration, valuesMap, xMap, yMap;

          xMap = properties.x.get();
          yMap = properties.y.get();
          keyMap = properties.key.get();
          valuesMap = properties.values.get();
          keyFilter = properties.keyFilter.get();
          transitionDuration = properties.transitionDuration.get();
          data = raw.map(function(g) {
            return {
              key: keyMap(g),
              color: g.color,
              values: (valuesMap(g)).map(function(d) {
                return [xMap(d), yMap(d)];
              })
            };
          });
          keys = data.map(function(g) {
            return g.key;
          }).filter(keyFilter);
          line = d3.svg.line().interpolate('basis').x(function(d) {
            return x(d[0]);
          }).y(function(d) {
            return y(d[1]);
          });
          layers = data;
          layers = layers.map(function(layer) {
            if (keys.indexOf(layer.key) < 0) {
              layer.values.map(function(d) {
                d[1] = 0;
                return d;
              });
            }
            return layer;
          });
          x.domain(d3.extent(layers[0].values.map(function(d) {
            return d[0];
          })));
          scaleLayers = data.filter(function(g) {
            return keys.indexOf(g.key) > -1;
          });
          y.domain([
            0, d3.max(scaleLayers, function(g) {
              return d3.max(g.values, function(d) {
                return d[1];
              });
            })
          ]);
          $selection = d3.select(this);
          $svg = $selection.selectAll('svg').data([data]);
          $gEnter = $svg.enter().append('svg').append('g');
          $svg.attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);
          $g = $svg.select('g').attr('transform', "translate(" + margin.left + "," + margin.top + ")");
          $line = $g.selectAll('.data.line').data(layers);
          $line.enter().append('path').attr('class', 'data line');
          $line.attr('data-key', function(d) {
            return d.key;
          }).style('stroke', function(d) {
            return d.color;
          }).on('mouseover', function(d) {
            return mouseEvents.mouseover(d.key);
          }).on('mouseout', function(d) {
            return mouseEvents.mouseout(d.key);
          });
          $line.transition().duration(500).attr('d', function(d) {
            return line(d.values);
          }).style('opacity', function(d) {
            if (keys.indexOf(d.key) < 0) {
              return 0;
            } else {
              return 1;
            }
          });
          $gEnter.append('g').attr('class', 'x axis');
          $xAxis = $svg.select('.x.axis').attr("transform", "translate(0," + height + ")");
          $xAxis.transition().duration(transitionDuration).call(xAxis).selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-90)");
          $gEnter.append('g').attr('class', 'y axis');
          $yAxis = $svg.select('.y.axis');
          $yAxis.transition().duration(transitionDuration).call(yAxis);
          return null;
        });
      };
      null;
      chart = Property.expose(chart, properties);
      chart.mouseover = function(delegate) {
        dispatch.on('mouseover', delegate);
        return chart;
      };
      chart.mouseout = function(delegate) {
        dispatch.on('mouseout', delegate);
        return chart;
      };
      chart.mousemove = function(delegate) {
        dispatch.on('mousemove', delegate);
        return chart;
      };
      return chart;
    };
  });

}).call(this);
