let globalData = null;
let selectedMax = null;
let selectedMin = null;

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
	.then((data) => data.json())
	.then((data) => {
		globalData = data;
		[selectedMin, selectedMax] = d3.extent(data.monthlyVariance, d => d.year);

		d3.select('#slider-min-text')
			.text(selectedMin);
		d3.select('#slider-max-text')
			.text(selectedMax);
		d3.select('#slider-min')
			.on('change', (e) => {
				const value = +e.target.value;

				if (value < selectedMax - 8) {
					selectedMin = value;
					filterData();
				} else {
					selectedMin = selectedMax - 9;
					e.target.value = selectedMin;
					filterData();
				}

				handleInputMin(e);
			})
			.on('input', handleInputMin);
		d3.select('#slider-max')
			.on('change', (e) => {
				const value = +e.target.value;

				if (value > selectedMin + 8) {
					selectedMax = value;
					filterData();
				} else {
					selectedMax = selectedMin + 9;
					e.target.value = selectedMax;
					filterData();
				}
				handleInputMax(e);
			})
			.on('input', handleInputMax);

		construct(data);
	});

function construct(data) {
	const w = 1400;
	const h = 600;
	const padding = 60;

	const [minX, maxX] = d3.extent(data.monthlyVariance, d => d.year);
	const minY = 12;
	const maxY = 0;

	const yScale = d3.scaleLinear()
		.domain([minY, maxY])
		.range([h - padding, padding])
	const xScale = d3.scaleLinear()
		.domain([minX, maxX + 1])
		.range([padding, w - padding / 3])
	const legendScale = d3.scaleLinear()
		.domain([2.8, 12.8])
		.range([w / 2 - 112.5, w / 2 + 112.5])

	const tooltip = d3.select('#tooltip');

	const temperatures = [2.8, 3.9, 5, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8]
	const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
	const colors = [
		'rgb(69, 117, 180)',
		'rgb(116, 173, 209)',
		'rgb(171, 217, 233)',
		'rgb(224, 243, 248)',
		'rgb(255, 255, 191)',
		'rgb(254, 224, 144)',
		'rgb(253, 174, 97)',
		'rgb(244, 109, 67)',
		'rgb(215, 48, 39)'
	];

	const yAxis = d3.axisLeft(yScale)
		.tickFormat((_, i) => months[Math.abs(i - 13)]);
	const xAxis = d3.axisBottom(xScale)
		.tickFormat(d3.format("d"));
	const legendAxis = d3.axisBottom(legendScale)
		.tickFormat((_, i) => temperatures[i])
		.tickValues([2.8, 3.85, 4.95, 6.1, 7.2, 8.35, 9.45, 10.58, 11.7, 12.8]);

	const mouseover = (event) => {
		tooltip.style('display', 'unset');
		mousemove(event);
		d3.select(event.target)
			.raise()
			.style('stroke-width', '1px');
	}
	const mouseleave = (event) => {
		tooltip.style('display', 'none')
		d3.select(event.target).style('stroke-width', '0px')
	}
	const mousemove = (event) => {
		const target = d3.select(event.target);
		tooltip.html(`
            <p class="date">${target.attr('month')}, ${target.attr('data-year')}</p>
            <p class="average">Average surface temperature of <span class="temperature" style="color: ${target.attr('fill')};">${target.attr('data-temp')} ºC</span></p>
            <p class="variance">Variance from base temperature of  <span class="temperature" style="color: ${target.attr('fill')};">${target.attr('variance')} ºC</span></p>
        `).attr('data-year', target.attr('data-year'))
			.style("top", (event.pageY + 20) + "px")
			.style("left", "clamp(0px, " + (event.pageX - 165) + "px, 100vw - 330px)");
	}

	const svg = d3.select('svg');

	svg.selectAll('rect')
		.data(data.monthlyVariance)
		.enter()
		.append('rect')
		.attr('x', d => xScale(d.year) + 1)
		.attr('y', d => yScale(d.month - 1))
		.attr('width', d => xScale(d.year + 1) - xScale(d.year))
		.attr('height', (h - 2 * padding) / 12)
		.attr('fill', d => {
			const monthlyVariance = data.baseTemperature + d.variance;
			if (monthlyVariance <= 3.9) return colors[0];
			if (monthlyVariance <= 5) return colors[1];
			if (monthlyVariance <= 6.1) return colors[2];
			if (monthlyVariance <= 7.2) return colors[3];
			if (monthlyVariance <= 8.3) return colors[4];
			if (monthlyVariance <= 9.5) return colors[5];
			if (monthlyVariance <= 10.6) return colors[6];
			if (monthlyVariance <= 11.7) return colors[7];
			if (monthlyVariance <= 12.8) return colors[8];
			return 'rgb(165, 0, 38)';
		})
		.attr('class', 'cell')
		.attr('data-year', d => d.year)
		.attr('month', d => months[d.month])
		.attr('data-month', d => d.month)
		.attr('variance', d => Math.round(d.variance * 100) / 100)
		.attr('data-temp', d => Math.round((data.baseTemperature + d.variance) * 100) / 100)
		.style('stroke', 'black')
		.style('stroke-width', '0px')
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseleave', mouseleave);

	svg.append('g')
		.attr('id', 'y-axis')
		.attr('transform', 'translate(' + padding + "," + (h - 2 * padding) / 24 + ")")
		.call(yAxis);

	svg.append('g')
		.attr('id', 'x-axis')
		.attr('transform', 'translate(0, ' + (h - padding) + ")")
		.call(xAxis);

	svg.append('g')
		.attr('id', 'legend')
		.selectAll('rect')
		.data(colors)
		.enter()
		.append('rect')
		.attr('fill', (d, i) => colors[i])
		.attr('width', 25)
		.attr('height', 25)
		.attr('x', (d, i) => (w - 225 + 50 * i) / 2)
		.attr('y', h - padding / 2 - 3);

	svg.select('#legend')
		.append('g')
		.attr('id', 'legend-axis')
		.attr('transform', 'translate(0, ' + (h - padding / 2 + 22) + ")")
		.call(legendAxis);

	svg.append('text')
		.attr('id', 'title')
		.text("Monthly Global Land-Surface Temperature")
		.style('font-size', '26px')
		.attr('x', (w - d3.select('#title').node().getBBox().width) / 2)
		.attr('y', 30);

	svg.append('text')
		.attr('id', 'description')
		.text("1753 - 2015: base temperature 8.66ºC")
		.style('font-size', '18px')
		.attr('x', (w - d3.select('#description').node().getBBox().width) / 2)
		.attr('y', 50);

	svg.select('#y-axis .tick').remove();
	svg.select('#y-axis .domain')
		.attr('transform', 'translate(0, ' + -(h - 2 * padding) / 24 + ")");
}

function filterData() {
	const isInsideInterval = (value) => value >= selectedMin && value <= selectedMax;
	const newData = { baseTemperature: 8.66 };

	newData.monthlyVariance = globalData.monthlyVariance.filter(({ year }) => isInsideInterval(year));

	clear();
	construct(newData);
}

function clear() {
	d3.select('#graph').html('<div id="graph"><svg viewBox="0 0 1400 610"></svg></div>');
}

function handleInputMin(e) {
	if (e.target.value < selectedMax - 8) {
		d3.select('#slider-min-text')
			.text(e.target.value)
			.style('left', ((e.target.value - 1753) / 262) * 97 + "%");
		d3.select('.slider-progress')
			.style('width', 100 * Math.abs((((e.target.value - 1753) / 262) - ((selectedMax - 1753) / 262))) + "%")
			.style('left', 100 * (e.target.value - 1753) / 262 + "%");
	}
}

function handleInputMax(e) {
	if (e.target.value > selectedMin + 8) {
		d3.select('#slider-max-text')
			.text(e.target.value)
			.style('left', ((e.target.value - 1753) / 262) * 97 - 97 + "%");

		d3.select('.slider-progress')
			.style('width', 100 * Math.abs((((selectedMin - 1753) / 262) - ((e.target.value - 1753) / 262))) + "%")
			.style('left', 100 * (selectedMin - 1753) / 262 + "%");
	}
}