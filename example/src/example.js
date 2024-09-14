import Chart from 'chart.js/auto';
import draggableSelectRangePlugin from 'chartjs-plugin-draggable-selectrange';
import data from './data.json';

Chart.register(draggableSelectRangePlugin);

(async function()
{
    // Plugin config
    const draggableSelectRangeConfig =
    {
        enable: true,

        unselectColor: "rgba(255,255,255,0.65)",

        borderColor: "#2388FF",
        borderWidth: 2,

        text:
        {
            enable: true,
            color: "#000",

            offset: -15,
            padding: 1,

            font:
            {
                family: 'Arial',
                size: 13
            }
        },

        onSelect: (event) =>
        {
            console.log(event)

            // Show selected range in html
            document.getElementById("range_from").innerHTML = event.range[0];
            document.getElementById("range_to").innerHTML = event.range[1];
        }
    }

    // Init chart
    let myChart = new Chart(
        document.getElementById('example'),
        {
            type: 'line',

            data:
            {
                labels: [],

                datasets:
                [
                    {
                        data: [],

                        pointRadius: 0,
                        pointHoverRadius: 0,

                        borderColor: "#2388FF",
                        backgroundColor: () =>
                        {
                            const ctx = document.getElementById('example').getContext("2d");
                            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);

                            gradient.addColorStop(0, 'rgba(141,193,255,1)');
                            gradient.addColorStop(1, 'rgba(141,193,255,0)');

                            return gradient;
                        },

                        fill: true
                    }
                ]
            },

            options:
            {
                maintainAspectRatio: false,

                plugins:
                {
                    tooltip:
                    {
                        enabled: true,
                        displayColors: false,

                        filter: function (context)
                        {
                            const chart = context.chart;
                            const dataIndex = context.dataIndex;

                            if(chart.config.options.plugins.draggableSelectRange.startDataIndex === undefined &&
                               chart.config.options.plugins.draggableSelectRange.endDataIndex === undefined)
                            {
                                return true;
                            }

                            return (chart.config.options.plugins.draggableSelectRange.startDataIndex <= dataIndex &&
                                    chart.config.options.plugins.draggableSelectRange.endDataIndex >= dataIndex);
                        },

                        usePointStyle: false
                    },

                    filler:
                    {
                        propagate: false
                    },

                    title:
                    {
                        display: false
                    },

                    legend:
                    {
                        display: false,
                    },

                    draggableSelectRange: draggableSelectRangeConfig
                },

                interaction:
                {
                    intersect: false,
                },

                elements:
                {
                    line:
                    {
                        tension: 0.15
                    }
                },

                scales:
                {
                    x:
                    {
                        ticks:
                        {
                            font:
                            {
                                size: 16
                            },

                            color: '#666F8D',
                            align: 'center',
                            labelOffset: -45,
                            padding: 10
                        }
                    },

                    y:
                    {
                        ticks:
                        {
                            font:
                            {
                                size: 13
                            },

                            color: '#666F8D'
                        }
                    }
                }
            }
        }
    );

    // Set data in chart
    function setData(data)
    {
        myChart.data.datasets[0].data = data;

        let max = Math.ceil(Math.max(...data.map(item => item.y)) / 10) + 1;
        let min = Math.floor(Math.min(...data.map(item => item.y)) / 10);

        min -= (min > 1 ? 1 : 0);

        myChart.options.scales.y.min = 10 * min;
        myChart.options.scales.y.max = 10 * max;

        myChart.options.scales.y.ticks.stepSize = 10;
        myChart.options.scales.x.ticks.count = data.length;

        myChart.options.scales.x.ticks.callback = (val, index) =>
        {
            let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let month = parseInt(data[index].x.split("-")[0]);

            if(data.length === index + 1 || parseInt(data[index + 1].x.split("-")[0]) !== month)
            {
                return months[month - 1];
            }
        };

        myChart.update();
    }

    // It method for clear selected range
    function Clear()
    {
        draggableSelectRangePlugin.clearDraw(myChart);

        // Clear data from page
        myChart.config.options.plugins.draggableSelectRange.startDataIndex = undefined;
        myChart.config.options.plugins.draggableSelectRange.endDataIndex = undefined;

        document.getElementById("range_from").innerHTML = "---";
        document.getElementById("range_to").innerHTML = "---";
    }

    // It method for set a custom range from '04-24' to '09-08'
    function SetRange()
    {
        draggableSelectRangePlugin.setRange(myChart, draggableSelectRangeConfig, ['04-24', '09-08']);

        // Set data in page
        document.getElementById("range_from").innerHTML = '04-24';
        document.getElementById("range_to").innerHTML = '09-08';
    }

    // Set methods for button on click event
    document.getElementById("setRangeBtn").onclick = SetRange;
    document.getElementById("clearBtn").onclick = Clear;

    // Resolve Data
    const myData = data.map(item =>
    ({
        y: parseFloat(item["price_number"]),
        x: item["date_year_j"]
    }));

    //Set Data
    setData(myData);
})();