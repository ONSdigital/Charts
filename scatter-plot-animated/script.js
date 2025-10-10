import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, sliderDomain, sliderSimple, svg, animating;

function drawGraphic() {
	// Remove any existing chart elements
	d3.select('#slider-simple').selectAll('*').remove();

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);


	let margin = config.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;

	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height = Math.ceil(
		(chart_width * config.aspectRatio[size][1]) /
		config.aspectRatio[size][0]
	);

	//Set the timepoints from the data for the slider labels and sort from oldest to newest
	let timepoints = [...new Set(graphic_data.map((d) => d.year))].sort();

	//Takes the last data point from the date series

	let timeLoad = config.timeLoad;

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]);

	const y = d3.scaleLinear().range([height, 0]);

	function drawSliderButtons() {
		//Set the initial timepoint for the data load at from the config

		let a = config.timeLoad;

		//Set the date format for the slider label

		let dateformat = d3.timeFormat(config.dateFormat);
		let dateparse = d3.timeParse(config.dateParse);

		//Make the slider

		function makeSlider() {
			sliderDomain = [0, timepoints.length - 1]; //set the domain according to the length of the timepoints

			//Set the linear scale for the slider

			let sliderScale = d3
				.scaleLinear()
				.domain(sliderDomain)
				.range([0, chart_width - margin.right]);

			sliderSimple = d3
				.sliderHorizontal(sliderScale)
				.step(1)
				.default(timepoints.indexOf(timeLoad)) //defaults the the slider to load with data from timeLoad in the config
				.width(chart_width - 150)
				.displayFormat(function (i) {
					return dateformat(dateparse(timepoints[i]));
				}) //labels taken from timepoints
				.displayValue(true)
				.handle(d3.symbol().type(d3.symbolCircle).size(500)) //Handle colour is set in the chart.css file under parameter handle
				.fill('#206095')
				.ticks(0)
				.on('onchange', function (val) {
					// a is the master variable for the current timepoint
					if (a !== val) {
						// if a has changed
						a = val;
					}
					updateVisuals(
						graphic_data.filter(function (d) {
							return d.year == timepoints[val];
						})
					); //update the chart according to the timepoint value from the slider by filtering on the timepoint
				});

			//call the slider

			d3.select('#slider-simple')
				.append('svg')
				.attr('width', chart_width - 75)
				.attr('height', 100)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',19)')
				.call(sliderSimple);

			d3.selectAll('.parameter-value text');
		}

		//Set the function of each play, forward and back buttons

		function setButtons() {
			d3.select('#play').on('click', onPlay);

			d3.select('#forward').on('click', fwd_animate);

			d3.select('#back').on('click', rev_animate);
		}

		//Call the functions to set the buttons and make the slider

		setButtons();
		makeSlider();

		//Function to move the slider and retrieve the value from the slider

		function moveSliderToVal() {
			sliderSimple.silentValue(a);
		}

		//Forward animation function for the buttons

		function fwd_animate() {
			// go forwards in time and then back to the beginning once it reaches the end
			if (a < timepoints.length - 1) {
				a = a + 1;
			} else {
				a = 0;
			}
			moveSliderToVal(); //retrieves the value from the slider
			updateVisuals(
				graphic_data.filter(function (d) {
					return d.year == timepoints[a];
				})
			); //update the chart according to the timepoint value from the slider by filtering on the timepoint
		}

		//Backwards animation function for the buttons

		function rev_animate() {
			// go back in time
			if (a > 0) {
				a = a - 1;
			} else {
				a = variables.length - 1;
			}
			moveSliderToVal(); //retrieves the value from the slider
			updateVisuals(
				graphic_data.filter(function (d) {
					return d.year == timepoints[a];
				})
			); //update the chart according to the timepoint value from the slider by filtering on the timepoint
		}

		//Function for clicking on the play button

		function onPlay() {
			fwd_animate(); // don't need a delay bfeore first animation
			animating = setInterval(function () {
				fwd_animate();
			}, 1500); //sets an brief interval before moving the slider on one point

			// replace play control with pause
			d3.select('#play')
				.select('span')
				.classed('glyphicon-play', false)
				.classed('glyphicon-pause', true);

			// switch id/class of play to pause
			d3.select('#play').attr('id', 'pause');
			// change button event from play to pause
			d3.select('#pause').on('click', onPause);
		}

		//Function for clicking on the pause button
		function onPause() {
			// replace pause symbol with play symbol
			d3.select('#pause')
				.select('span')
				.classed('glyphicon-pause', false)
				.classed('glyphicon-play', true);
			d3.select('#pause').attr('id', 'play');
			// make symbols clickable
			setButtons(); //Resets the buttons
			clearInterval(animating); //stops the animation from moving forwards
		}
	}

	//if config drawSliderButtons is set to true, draw the buttons etc

	if (config.drawSliderButtons === true) {
		drawSliderButtons();
	} else {
		d3.selectAll('.flex-container').remove();
	}

	//set up yAxis generator
	let yAxis = d3
		.axisLeft(y)
		.tickSize(-chart_width - 10)
		.tickFormat(d3.format(config.yDisplayFormat));

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height - 10)
		.tickFormat(d3.format(config.xDisplayFormat))
		.ticks(config.xAxisTicks[size]);

	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	// Set the scales for the chart - auto calculates the scale from the data or you can select your own in the config
	//X scale
	if (config.xDomain == 'auto') {
		x.domain([
			d3.min(graphic_data, (d) => d.x),
			d3.max(graphic_data, (d) => d.x)
		]);
	} else {
		x.domain(config.xDomain);
	}

	//Y Scale
	if (config.yDomain == 'auto') {
		y.domain([
			d3.min(graphic_data, (d) => d.y),
			d3.max(graphic_data, (d) => d.y)
		]);
	} else {
		y.domain(config.yDomain);
	}

	//Draws the x axis zero line
	svg
		.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'x axis')
		.call(xAxis)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

	//Draws the y axis zero line
	svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		})
		.selectAll('text')
		.call(wrap, margin.left - 10);

	//remove the highlight stroke on mobile
	if (size == 'sm') {
		d3.selectAll('.dots').attr('stroke', config.colourPalette);
	}

	// // This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: -(margin.left - 2),
		yPosition: -20,
		text: config.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chart_width
	});

	// // This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 35,
		text: config.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	});

	//Initial draw of the chart with the data filtered on the timeLoad specified

	updateVisuals(
		graphic_data.filter(function (d) {
			return d.year == timeLoad;
		})
	);

	//Function to update the visuals

	function updateVisuals(data) {
		// create a tooltip
		let tooltip = d3
			.selectAll('body')
			.append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0);

		//Set the date format
		let data_format = d3.format('.1f');

		// Three functions that change the tooltip when user hover / move / leave the circle

		let mouseover = function (d) {
			tooltip.style('opacity', 1);
			d3.select(this).style('stroke', 'orange').style('opacity', 1);
		};
		let mousemove = function (event, d) {
			// console.log(d3.pointer(event))
			if (size == 'lg') {
				tooltip
					.html(
						'<span style ="color: #206095;font-size: 15px;">' +
						d.group +
						'</span>' +
						'<br><br>' +
						'<span style="font-weight:500; opacity:1">' +
						'Wage growth: ' +
						data_format(d.y) +
						' p.p.' +
						'</span>' +
						'<br>' +
						'<span style="font-weight:500; opacity:1">' +
						'Median hourly pay (£): ' +
						data_format(d.x) +
						'%' +
						'</span>'
					)
					.style(
						'left',
						d3.pointer(event)[0] > chart_width - 200
							? d3.pointer(event)[0] - 200 + 'px'
							: d3.pointer(event)[0] + 25 + 'px'
					)
					.style(
						'top',
						d3.pointer(event)[1] < 25
							? d3.pointer(event)[1] + 150 + 'px'
							: d3.pointer(event)[1] - 20 + 'px'
					);
				// .style("top", (d3.pointer(event)[1]-20) + "px")
			} else {
				tooltip
					.html(
						'<span style ="color: #206095; font-size: 15px;">' +
						d.group +
						'</span>' +
						'<br><br>' +
						'<span style="font-weight:500; opacity:1">' +
						'Wage growth: ' +
						data_format(d.y) +
						' p.p.' +
						'</span>' +
						'<br>' +
						'<span style="font-weight:500; opacity:1">' +
						'Median hourly pay (£): ' +
						data_format(d.x) +
						'%' +
						'</span>'
					)
					.style('right', 5 + 'px')
					.style('top', 0 + 'px');
			}
		};
		let mouseleave = function (d) {
			if (size == 'lg') {
				tooltip.style('opacity', 0);
				d3.select(this)
					.style('opacity', 0.75)
					.style('stroke', (d) =>
						d.highlight == 0 ? config.colourPalette : '#222222'
					);
			} else {
				tooltip.style('opacity', 0);
				d3.select(this)
					.style('opacity', 0.75)
					.style('stroke', config.colourPalette);
			}
		};

		//draw the circles with transition if slider is drawn

		let t = d3.transition().duration(750).ease(d3.easeCircle);

		svg
			.selectAll('circle')
			.data(data)
			.join('circle')
			.merge(d3.selectAll('circle'))
			.attr('class', 'dots')
			.transition(t)
			.attr('cx', (d) => x(d.x))
			.attr('cy', (d) => y(d.y))
			.attr('r', config.size)
			.attr('fill', config.colourPalette)
			.attr('opacity', 0.75)
			.attr('stroke-width', (d) => (d.highlight == 0 ? '1px' : '1.5px'))
			.attr('stroke', (d) =>
				d.highlight == 0 ? config.colourPalette : '#222222'
			);

		d3.selectAll('.dots')
			.on('mouseover', mouseover)
			.on('mousemove', mousemove)
			.on('mouseleave', mouseleave)
			.on('click', function (event, d) {
				d3.pointer(event)[0];
			});

		//draw legend on desktop

		//if screen is larger than medium threshold and highlight is true in config, add the labels

		if (
			(size == 'lg' &&
				config.highlight === true) === true
		) {
			drawHighlight();
		} //end if for datalabels

		//if you have lots of labels, you can choose whether you want them to sit above, below or in the middle of the circle using the label_y column in data.csv
		//if you have lots of labels, you can choose whether you want them to start or end on the circle using the label_anchor column in data.csv

		function drawHighlight() {
			// d3.selectAll('.dataLabels').remove()
			svg
				.selectAll('text.dataLabels')
				.data(data)
				.join('text')
				.merge(d3.selectAll('text.dataLabels'))
				.transition(t)
				.attr('class', 'dataLabels')
				.attr('id', function (d, i) {
					return d.group;
				})
				.style('font-size', '14px')
				.style('font-weight', 500)
				.attr('x', function (d) {
					if (d.label_y == 'middle' && d.label_anchor == 'start') {
						return x(d.x) + config.size + 6;
					} // shifts to the side of the circle when text anchor is middle
					else if (d.label_y == 'middle' && d.label_anchor == 'end') {
						return x(d.x) - config.size - 6;
					} // shifts to the other side of the circle when text anchor is middle
					else {
						return x(d.x);
					}
				})
				// .attr('y',function(d) { return (y(d.y) < (topYTick) ? (y(d.y)+config.size+15) : (y(d.y)-config.size)-2 )})
				.attr('y', function (d) {
					if (d.label_y == 'top') {
						return y(d.y) - config.size - 6;
					} else if (d.label_y == 'bottom') {
						return y(d.y) + config.size + 15;
					} else if (d.label_y == 'middle') {
						return y(d.y);
					} else {
						return y(d.y) - config.size - 2;
					}
				})
				.style('text-anchor', function (d) {
					if (d.label_anchor == 'start') {
						return d.label_anchor;
					} else if (d.label_anchor == 'middle') {
						return d.label_anchor;
					} else if (d.label_anchor == 'end') {
						return d.label_anchor;
					} else {
						return 'start';
					}
				})
				.text((d) => (d.highlight == 0 ? null : d.group));
		}
	} //end updateVisuals function

	//create link to source
	addSource('source', config.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
} ///END DRAW GRAPHIC

d3.csv(config.graphic_data_url).then((data) => {
	//load chart data
	data.forEach(function (d) {
		d.x = +d.x;
		d.y = +d.y;
		d.size = +d.size;
		d.highlight = +d.highlight;
	});

	graphic_data = data;
	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
