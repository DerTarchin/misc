var data1 = window.chartdata1;
var data2 = window.chartdata2;

var color = Chart.helpers.color;
var radarChartData = {
    labels: ["10-18mm","19-25mm","26-35mm","36-50mm","51-75mm","76-105mm","106-200mm","201-1000mm"],
    datasets: [{
        label: "Hizal",
        backgroundColor: 'rgba(149,32,78,0.5)',
        borderColor: "#95204e",
        pointBackgroundColor: "#95204e",
        data: [],
        tooltipTemplate: "<%if (label){%><%=label %>: <%}%><%= value + ' %' %>",
    }, {
        label: "Soonho",
        backgroundColor: "rgba(17,91,116,0.5)",
        borderColor: "#115b74",
        pointBackgroundColor: "#115b74",
        data: [],
        tooltipTemplate: "<%if (label){%><%=label %>: <%}%><%= value + ' %' %>",
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
                text: 'Focal Length, as % of total images.'
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