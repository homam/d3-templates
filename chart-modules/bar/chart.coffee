# bar
# some properties are specific for histograms
define ['../common/property'], (Property) ->
  () ->
    # configs
    margin =
      top: 20
      right: 0
      bottom: 20
      left: 70
    width = 720
    height = 300


    x = d3.scale.ordinal()
    y = d3.scale.linear()

    xAxis = d3.svg.axis().scale(x).orient('bottom')
    yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(d3.format(','))



    nameMap = (d) ->d.name
    valueMap  = (d) ->d.value
    devMap = null # (d) ->d.dev

    tooltip = () ->


    dispatch = d3.dispatch('mouseover', 'mouseout')



    # configurable properties

    properties = {
      width: new Property (value) ->
        width = value - margin.left-margin.right
        x.rangeRoundBands([0,width], .1)
        yAxis.tickSize(-width,0,0)

      height: new Property (value) ->
        height = value - margin.top-margin.bottom
        y.range([height,0])

      margin: new Property (value) ->
        margin = _.extend margin, value
        properties.width.reset()
        properties.height.reset()

      names : new Property (value) -> nameMap = value

      values : new Property (value) ->valueMap = value

      devs : new Property (value) -> devMap = value

      tooltip : new Property (value) -> tooltip = value

      # numebr, used in histograms
      drawExpectedValue: new Property

      # number, used in histograms
      coalescing: new Property
    }

    properties.width.set(width)
    properties.height.set(height)

    chart = (selection) ->
      selection.each (data) ->

        $selection = d3.select(this)

        chartData = data

        # in histograms
        coalescing = properties.coalescing.get()
        if !!coalescing
          chartData = _(data).foldl ((acc, a, i) ->
            if i <= coalescing
              acc.push({name: a.name, value: a.value})
            else
              acc[coalescing].value += a.value
            #acc[coalescing].name = coalescing + "+"
            return acc), []


        $svg = $selection.selectAll('svg').data([chartData])
        $gEnter = $svg.enter().append('svg').append('g')

        $svg.attr('width', width+margin.left+margin.right).attr('height', height+margin.top+margin.bottom)
        $g = $svg.select('g').attr('transform', "translate(" + margin.left + "," + margin.top + ")")


        $gEnter.append('g').attr('class', 'x axis')
        $xAxis = $svg.select('.x.axis').attr("transform", "translate(0," + (height)+ ")")

        $gEnter.append('g').attr('class', 'y axis')
        $yAxis = $svg.select('.y.axis')



        keys = _.flatten chartData.map nameMap
        x.domain(keys)
        y.domain([0, d3.max chartData.map valueMap ])

        $main = $g.selectAll('g.main').data(chartData)
        $mainEnter = $main.enter().append('g').attr('class','main')
        $main.transition().duration(200)

        $mainEnter.append('rect')
        .on('mouseover', (d) -> dispatch.mouseover(d))
        .on('mouseout', (d) -> dispatch.mouseout(d))
        .call(tooltip)

        $rect = $main.select('rect')
        $rect.transition().duration(200).attr('width', x.rangeBand())
        .attr('x', (d) -> x(nameMap(d)))
        .attr('y', (d) -> y(valueMap(d)))
        .attr('height', (d)-> height-y(valueMap(d)))
        .style('fill', (d,i)-> '#ff7f0e')


        # in histograms
        if properties.drawExpectedValue.get()
          total = _(data).map((d) -> d.value).reduce (a,b) -> a+b
          distribution = _(data).map((d) -> d.name * d.value/total)
          expectedValue = distribution.reduce (a,b) -> a+b

          $expGEnter = $gEnter.append('g').attr('class','exp')
          $expG = $g.select('g.exp')
          .transition().duration(200)

          $expGEnter.append('line').attr('class', 'exp')

          expX = x(Math.floor expectedValue) + (expectedValue - Math.floor(expectedValue)) * x.rangeBand()

          $expG.select('line.exp')
          .transition().duration(200)
          .attr('x1', expX).attr('x2', expX)
          .attr('y1', 0).attr('y2', height)




        # deviation lines
        if !!devMap
          $devGEnter = $mainEnter.append('g').attr('class','dev')
          $devG = $main.select('g.dev')
          .transition().duration(200)
          .attr('transform', (d) -> 'translate(0,'+(-height+y(valueMap(d))-(-height+y(devMap(d)))/2)+')')

          $devGEnter.append('line').attr('class', 'dev up')
          $devG.select('line.dev.up')
          .transition().duration(200)
          .attr('x1', _.compose(x, nameMap)).attr('x2', (d) -> _.compose(x, nameMap)(d)+x.rangeBand())
          .attr('y1', _.compose y, devMap).attr('y2', _.compose y, devMap)

          $devGEnter.append('line').attr('class', 'dev low')
          $devG.select('line.dev.low')
          .transition().duration(200)
          .attr('x1', _.compose(x, nameMap)).attr('x2', (d) -> _.compose(x, nameMap)(d)+x.rangeBand())
          .attr('y1', y(0)).attr('y2',y(0))

          $devGEnter.append('rect').attr('class', 'dev')
          $devG.select('rect.dev')
          .transition().duration(200).attr('width', x.rangeBand()*.25)
          .attr('x', (d) -> x(nameMap(d))+x.rangeBand()*.375)
          .attr('y', _.compose y, devMap)
          .attr('height', (d)-> height- (_.compose y, devMap)(d))




        $main.exit().select('rect').attr('y', 0).attr('height', 0)




        $xAxis.transition().duration(200).call(xAxis)
        .selectAll("text")
        .text((d) -> if !!coalescing and d >= coalescing then (d + "+") else d)
        #.style("text-anchor", "end").style("font-size", "10px").attr("dx", "2em").attr("transform", "rotate(0)")
        $yAxis.transition().duration(200).call(yAxis)

        null # selection.each()
    null # chart()




    # expose the properties

    chart = Property.expose(chart, properties)
    chart.mouseover = (handler) -> dispatch.on('mouseover', handler)

    return chart