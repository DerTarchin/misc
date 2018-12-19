var data1 = window.chartdata1;
var data2 = window.chartdata2;

var color = Chart.helpers.color;
var radarChartData = {
    labels: ["f1.4","f1.8","f2","f2.8","f4","f5.6","f8","f11","f16","f22"],
    datasets: [{
        label: "Hizal",
        backgroundColor: 'rgba(70,205,207,0.5)',
        borderColor: "#46cdcf",
        pointBackgroundColor: "#46cdcf",
        data: []
    }, {
        label: "Soonho",
        backgroundColor: "rgba(72,70,109,0.5)",
        borderColor: "#48466d",
        pointBackgroundColor: "#48466d",
        data: []
    },]
}

var data = data1;
for(var d=0; d<data.length; d++) {
	radarChartData.datasets[0].data.push( data[d] );
}

data = data2;
for(var d=0; d<data.length; d++) {
	radarChartData.datasets[1].data.push( data[d] );
}

window.onload = function() {
    var ctx = document.getElementById("canvas").getContext("2d");
	window.myRadar = new Chart(ctx, {
		type: 'radar',
        data: radarChartData,
        options: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Aperture, as % of total images.'
            },
            responsive: true,
            maintainAspectRatio: false,
            // legend: { display: false },
            scale: {
            	gridLines: {
					display: false,
					color: 'rgba(0,0,0,0)',
				},
            	ticks: {
                	beginAtZero: true
            	}
            },
        }
    });
};

console.log(radarChartData);