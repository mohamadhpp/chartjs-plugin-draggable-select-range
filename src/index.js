class State
{
    #states;

    constructor()
    {
        this.#states = new WeakMap();
    }

    get = (chart) =>
    {
        const state = this.#states.get(chart);

        return state || null;
    }

    set = (chart, updatedState) =>
    {
        const originalState = this.get(chart);
        this.#states.set(chart, Object.assign({}, originalState, updatedState));

        return updatedState;
    }
}

class Graphic
{
    #states;

    constructor(states)
    {
        this.#states = states;
    }

    draw = (chart, options) =>
    {
        const state = this.#states.get(chart);

        if(!state ||
            (state.selectionXY.drawing === false && !state.selectionXY.end.x) ||
            state.selectionXY.end.x === state.selectionXY.start.x)
        {
            options.startDataIndex = undefined;
            options.endDataIndex = undefined;

            return;
        }

        const { ctx } = chart;
        ctx.save();

        ctx.globalCompositeOperation = "xor";
        ctx.fillStyle = options.unselectColor;

        let y = chart.chartArea.top;
        let height = chart.chartArea.height;

        let x1 = chart.chartArea.left;
        let w1 = ((state.selectionXY.start.x - chart.chartArea.left) || 0);

        let x2 = (state.selectionXY.end.x || 0);
        let w2 = (chart.chartArea.right - (state.selectionXY.end.x || 0));

        //Check Reverse Select Range
        if((state.selectionXY.end.x || 0) < (state.selectionXY.start.x  || 0))
        {
            w1 = ((state.selectionXY.end.x - chart.chartArea.left) || 0);

            x2 = (state.selectionXY.start.x || 0);
            w2 = (chart.chartArea.right - (state.selectionXY.start.x || 0));
        }

        ctx.fillRect(x1, y, w1, height);
        ctx.fillRect(x2, y, w2, height);

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = options.borderColor;

        ctx.fillRect(state.selectionXY.start.x, y, options.borderWidth, height);
        ctx.fillRect(state.selectionXY.end.x, y, options.borderWidth, height);

        if(options.text.enable && (state.selectionXY.drawing || (options.startDataIndex && options.endDataIndex)))
        {
            ctx.font = ` ${options.text.font.size}px ${options.text.font.family}`;
            ctx.fillStyle = options.text.color;

            let startAxisValue = chart.data.labels[state.selectionXY.start.axisIndex];
            let endAxisValue = chart.data.labels[state.selectionXY.end.axisIndex];

            const textCallback = chart.config.options.plugins.draggableSelectRange.text.callback;

            if(textCallback)
            {
                startAxisValue = textCallback(startAxisValue);
            }

            ctx.fillText(startAxisValue, state.selectionXY.start.x + options.text.offset, y - options.text.padding);
            ctx.fillText(endAxisValue, state.selectionXY.end.x + options.text.offset, y - options.text.padding);
        }

        ctx.restore();
    }

    getLabelXPosition = (chart, labelIndex) =>
    {
        if (!chart || !chart.data || !chart.data.labels || labelIndex < 0 || labelIndex >= chart.data.labels.length)
        {
            return null;
        }

        const xScale = chart.scales['x-axis'] || chart.options.scales.x;

        if (!xScale || !xScale.ticks)
        {
            return null;
        }

        const chartArea = chart.chartArea;
        const tickSpacing = (chartArea.right - chartArea.left) / (xScale.ticks.count - 1);
        const labelOffset = labelIndex * tickSpacing;

        return chartArea.left + labelOffset + tickSpacing / 2;
    }
}

/* Plugin */

const states = new State();
const Graphics = new Graphic(states);

export default
{
    id: "draggableSelectRange",

    start: (chart, args, options) =>
    {
        if(!chart.config.options.plugins.draggableSelectRange.enabled)
        {
            return;
        }

        const canvasElement = chart.canvas;

        canvasElement.addEventListener("mousedown", (e) =>
        {
            const axisElements = chart.getElementsAtEventForMode(e, "index", { intersect: false });

            if(axisElements.length === 0)
            {
                return;
            }

            const axisIndex = chart.getElementsAtEventForMode(e, "index", { intersect: false })[0].index;
            const axisValue = chart.data.labels[axisIndex];

            states.set(chart,
            {
                selectionXY:
                {
                    drawing: true,
                    start:
                    {
                        axisValue,
                        axisIndex,
                        x: e.offsetX,
                        y: e.offsetY
                    },

                    end: {}
                }
            });
        });

        window.addEventListener("mouseup", (e) =>
        {
            const state = states.get(chart);

            if(!state || state.selectionXY.drawing === false)
            {
                return;
            }

            const axisElements = chart.getElementsAtEventForMode(e, "index", { intersect: false });

            if(axisElements.length === 0)
            {
                states.set(chart,
                {
                    selectionXY:
                    {
                        drawing: false,
                        start: {},
                        end: {}
                    }
                });

                return;
            }

            const axisIndex = (axisElements.length > 0 ? axisElements[0].index : chart.data.labels.length - 1);
            const axisValue = chart.data.labels[axisIndex];

            if(state.selectionXY.start.axisValue > axisValue)
            {
                state.selectionXY.end = JSON.parse(JSON.stringify(state.selectionXY.start));
                state.selectionXY.start =  { axisValue, axisIndex, x: e.offsetX, y: e.offsetY }
            }
            else
            {
                state.selectionXY.end =
                {
                    axisValue,
                    axisIndex,
                    x: e.offsetX,
                    y: e.offsetY
                };
            }

            state.selectionXY.drawing = false;
            states.set(chart, state);

            chart.update();

            const selectCompleteCallback = chart.config.options.plugins.draggableSelectRange.onSelectComplete;

            if(chart.config.options.plugins.draggableSelectRange)
            {
                options.startDataIndex = state.selectionXY.start.axisIndex;
                options.endDataIndex = state.selectionXY.end.axisIndex;
            }

            if(selectCompleteCallback)
            {
                selectCompleteCallback(
                {
                    range:
                    [
                        state.selectionXY.start.axisValue,
                        state.selectionXY.end.axisValue
                    ],

                    boundingBox:
                    [
                        state.selectionXY.start,
                        [
                            state.selectionXY.end.x,
                            state.selectionXY.start.y,
                        ],

                        state.selectionXY.end,
                        [
                            state.selectionXY.start.x,
                            state.selectionXY.end.y,
                        ]
                    ]
                });
            }
        });

        canvasElement.addEventListener("mousemove", (e) =>
        {
            const state = states.get(chart);

            if(!state || state.selectionXY.drawing === false)
            {
                return;
            }

            const axisElements = chart.getElementsAtEventForMode(e, "index", { intersect: false });

            const axisIndex = (axisElements.length > 0 ? axisElements[0].index : chart.data.labels.length - 1);
            const axisValue = chart.data.labels[axisIndex];

            state.selectionXY.end =
            {
                axisValue,
                axisIndex,
                x: e.offsetX,
                y: e.offsetY
            };

            chart.render();
            states.set(chart, state);
        });
    },

    afterDraw: (chart, args, options) =>
    {
        Graphics.draw(chart, options);
    },

    setRange(chart, options, range)
    {
        let startIndex = 0;
        let endIndex = 0;

        let i = 0;

        for(; i < chart.data.labels.length; i++)
        {
            if(range[0] === chart.data.labels[i])
            {
                startIndex = i;
                break;
            }
        }

        for(; i < chart.data.labels.length; i++)
        {
            if(range[1] === chart.data.labels[i])
            {
                endIndex = i;
                break;
            }
        }

        options.startDataIndex = startIndex;
        options.endDataIndex = endIndex;

        states.set(chart,
        {
            selectionXY:
            {
                drawing: false,
                start:
                {
                    axisValue: range[0],
                    axisIndex: startIndex,
                    x: Graphics.getLabelXPosition(chart, startIndex),
                    y: 0
                },

                end:
                {
                    axisValue: range[1],
                    axisIndex: endIndex,
                    x: Graphics.getLabelXPosition(chart, endIndex),
                    y: chart.chartArea.height
                }
            }
        });

        this.defaults.startDataIndex =  range[0];
        this.defaults.endDataIndex =  range[1];

        Graphics.draw(chart, options);
        chart.render();

        return [startIndex, endIndex];
    },

    clearDraw(chart)
    {
        states.set(chart,
        {
            selectionXY:
            {
                drawing: false,
                start: {},
                end: {}
            }
        });

        chart.render();
    },

    defaults:
    {
        unselectColor: "rgba(255,255,255,0.65)",

        borderColor: "#2388FF",
        borderWidth: 2,

        startDataIndex: undefined,
        endDataIndex: undefined,

        text:
        {
            enable: false,
            color: "#000",

            offset: 0,
            padding: 0,

            font:
            {
                family: 'Arial',
                size: 13
            }
        }
    }
};