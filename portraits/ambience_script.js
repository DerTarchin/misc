var data = window.chartdata;

var color = Chart.helpers.color;
var scatterChartData = {
    datasets: [{
        label: "My First dataset",
        borderColor: window.chartColors.red,
        backgroundColor: color(window.chartColors.red).alpha(0.2).rgbString(),
        data: [],
        pointBorderColor: "rgba(0,0,0,0)",
        pointBackgroundColor: "rgba(255,255,255,.2)",
        pointBorderWidth: 0,
        pointRadius: 3,
    }]
};

for(var d=0; d<data.length; d++) {
	for(var i=0; i<data[d].length; i++) {
		scatterChartData.datasets[0].data.push( {x: d+1, y:data[d][i]} );
	}
}

window.onload = function() {
    var ctx = document.getElementById("canvas").getContext("2d");
    window.myScatter = Chart.Scatter(ctx, {
        data: scatterChartData,
        options: {
            title: { display: false },
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
            showLines: false,
            scales: {
				xAxes: [{ 
					gridLines: {
						display: false,
						color: 'rgba(0,0,0,0)',
					},
					ticks: {
						beginAtZero: true,
						display: false
					}
				}],
				yAxes: [{ 
					gridLines: {
						display: false,
						color: 'rgba(0,0,0,0)',
					},
					ticks: {
						beginAtZero: true,
						fontColor: "rgba(255,255,255,.3)"
					},
				}],
			},
        }
    });
};