"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _states = /*#__PURE__*/new WeakMap();
var State = /*#__PURE__*/_createClass(function State() {
  var _this = this;
  _classCallCheck(this, State);
  _classPrivateFieldInitSpec(this, _states, void 0);
  _defineProperty(this, "get", function (chart) {
    var state = _classPrivateFieldGet(_states, _this).get(chart);
    return state || null;
  });
  _defineProperty(this, "set", function (chart, updatedState) {
    var originalState = _this.get(chart);
    _classPrivateFieldGet(_states, _this).set(chart, Object.assign({}, originalState, updatedState));
    return updatedState;
  });
  _classPrivateFieldSet(_states, this, new WeakMap());
});
var _states2 = /*#__PURE__*/new WeakMap();
var Graphic = /*#__PURE__*/_createClass(function Graphic(states) {
  var _this2 = this;
  _classCallCheck(this, Graphic);
  _classPrivateFieldInitSpec(this, _states2, void 0);
  _defineProperty(this, "draw", function (chart, options) {
    var state = _classPrivateFieldGet(_states2, _this2).get(chart);
    if (!state || state.selectionXY.drawing === false && !state.selectionXY.end.x || state.selectionXY.end.x === state.selectionXY.start.x) {
      options.startDataIndex = undefined;
      options.endDataIndex = undefined;
      return;
    }
    var ctx = chart.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "xor";
    ctx.fillStyle = options.unselectColor;
    var y = chart.chartArea.top;
    var height = chart.chartArea.height;
    var x1 = chart.chartArea.left;
    var w1 = state.selectionXY.start.x - chart.chartArea.left || 0;
    var x2 = state.selectionXY.end.x || 0;
    var w2 = chart.chartArea.right - (state.selectionXY.end.x || 0);

    //Check Reverse Select Range
    if ((state.selectionXY.end.x || 0) < (state.selectionXY.start.x || 0)) {
      w1 = state.selectionXY.end.x - chart.chartArea.left || 0;
      x2 = state.selectionXY.start.x || 0;
      w2 = chart.chartArea.right - (state.selectionXY.start.x || 0);
    }
    ctx.fillRect(x1, y, w1, height);
    ctx.fillRect(x2, y, w2, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = options.borderColor;
    ctx.fillRect(state.selectionXY.start.x, y, options.borderWidth, height);
    ctx.fillRect(state.selectionXY.end.x, y, options.borderWidth, height);
    if (options.text.enable && (state.selectionXY.drawing || options.startDataIndex && options.endDataIndex)) {
      ctx.font = " ".concat(options.text.font.size, "px ").concat(options.text.font.family);
      ctx.fillStyle = options.text.color;
      var startAxisValue = chart.data.labels[state.selectionXY.start.axisIndex];
      var endAxisValue = chart.data.labels[state.selectionXY.end.axisIndex];
      var textCallback = chart.config.options.plugins.draggableSelectRange.text.callback;
      if (textCallback) {
        startAxisValue = textCallback(startAxisValue);
      }
      ctx.fillText(startAxisValue, state.selectionXY.start.x + options.text.offset, y - options.text.padding);
      ctx.fillText(endAxisValue, state.selectionXY.end.x + options.text.offset, y - options.text.padding);
    }
    ctx.restore();
  });
  _defineProperty(this, "getLabelXPosition", function (chart, labelIndex) {
    if (!chart || !chart.data || !chart.data.labels || labelIndex < 0 || labelIndex >= chart.data.labels.length) {
      return null;
    }
    var xScale = chart.scales['x-axis'] || chart.options.scales.x;
    if (!xScale || !xScale.ticks) {
      return null;
    }
    var chartArea = chart.chartArea;
    var tickSpacing = (chartArea.right - chartArea.left) / (xScale.ticks.count - 1);
    var labelOffset = labelIndex * tickSpacing;
    return chartArea.left + labelOffset + tickSpacing / 2;
  });
  _classPrivateFieldSet(_states2, this, states);
});
/* Plugin */
var states = new State();
var Graphics = new Graphic(states);
var _default = exports["default"] = {
  id: "draggableSelectRange",
  start: function start(chart, args, options) {
    if (!chart.config.options.plugins.draggableSelectRange.enable) {
      return;
    }
    var canvasElement = chart.canvas;
    canvasElement.addEventListener("mousedown", function (e) {
      var axisElements = chart.getElementsAtEventForMode(e, "index", {
        intersect: false
      });
      if (axisElements.length === 0) {
        return;
      }
      var axisIndex = chart.getElementsAtEventForMode(e, "index", {
        intersect: false
      })[0].index;
      var axisValue = chart.data.labels[axisIndex];
      states.set(chart, {
        selectionXY: {
          drawing: true,
          start: {
            axisValue: axisValue,
            axisIndex: axisIndex,
            x: e.offsetX,
            y: e.offsetY
          },
          end: {}
        }
      });
    });
    window.addEventListener("mouseup", function (e) {
      var state = states.get(chart);
      if (!state || state.selectionXY.drawing === false) {
        return;
      }
      var axisElements = chart.getElementsAtEventForMode(e, "index", {
        intersect: false
      });
      if (axisElements.length === 0) {
        states.set(chart, {
          selectionXY: {
            drawing: false,
            start: {},
            end: {}
          }
        });
        return;
      }
      var axisIndex = axisElements.length > 0 ? axisElements[0].index : chart.data.labels.length - 1;
      var axisValue = chart.data.labels[axisIndex];
      if (state.selectionXY.start.axisValue > axisValue) {
        state.selectionXY.end = JSON.parse(JSON.stringify(state.selectionXY.start));
        state.selectionXY.start = {
          axisValue: axisValue,
          axisIndex: axisIndex,
          x: e.offsetX,
          y: e.offsetY
        };
      } else {
        state.selectionXY.end = {
          axisValue: axisValue,
          axisIndex: axisIndex,
          x: e.offsetX,
          y: e.offsetY
        };
      }
      state.selectionXY.drawing = false;
      states.set(chart, state);
      chart.update();
      var selectCompleteCallback = chart.config.options.plugins.draggableSelectRange.onSelect;
      if (chart.config.options.plugins.draggableSelectRange) {
        options.startDataIndex = state.selectionXY.start.axisIndex;
        options.endDataIndex = state.selectionXY.end.axisIndex;
      }
      if (selectCompleteCallback) {
        selectCompleteCallback({
          range: [state.selectionXY.start.axisValue, state.selectionXY.end.axisValue],
          boundingBox: [state.selectionXY.start, [state.selectionXY.end.x, state.selectionXY.start.y], state.selectionXY.end, [state.selectionXY.start.x, state.selectionXY.end.y]]
        });
      }
    });
    canvasElement.addEventListener("mousemove", function (e) {
      var state = states.get(chart);
      if (!state || state.selectionXY.drawing === false) {
        return;
      }
      var axisElements = chart.getElementsAtEventForMode(e, "index", {
        intersect: false
      });
      var axisIndex = axisElements.length > 0 ? axisElements[0].index : chart.data.labels.length - 1;
      var axisValue = chart.data.labels[axisIndex];
      state.selectionXY.end = {
        axisValue: axisValue,
        axisIndex: axisIndex,
        x: e.offsetX,
        y: e.offsetY
      };
      chart.render();
      states.set(chart, state);
    });
  },
  afterDraw: function afterDraw(chart, args, options) {
    Graphics.draw(chart, options);
  },
  setRange: function setRange(chart, options, range) {
    var startIndex = 0;
    var endIndex = 0;
    var i = 0;
    for (; i < chart.data.labels.length; i++) {
      if (range[0] === chart.data.labels[i]) {
        startIndex = i;
        break;
      }
    }
    for (; i < chart.data.labels.length; i++) {
      if (range[1] === chart.data.labels[i]) {
        endIndex = i;
        break;
      }
    }
    options.startDataIndex = startIndex;
    options.endDataIndex = endIndex;
    states.set(chart, {
      selectionXY: {
        drawing: false,
        start: {
          axisValue: range[0],
          axisIndex: startIndex,
          x: Graphics.getLabelXPosition(chart, startIndex),
          y: 0
        },
        end: {
          axisValue: range[1],
          axisIndex: endIndex,
          x: Graphics.getLabelXPosition(chart, endIndex),
          y: chart.chartArea.height
        }
      }
    });
    this.defaults.startDataIndex = range[0];
    this.defaults.endDataIndex = range[1];
    Graphics.draw(chart, options);
    chart.render();
    chart.update();
    return [startIndex, endIndex];
  },
  clearDraw: function clearDraw(chart) {
    states.set(chart, {
      selectionXY: {
        drawing: false,
        start: {},
        end: {}
      }
    });
    chart.render();
  },
  defaults: {
    enable: false,
    unselectColor: "rgba(255,255,255,0.65)",
    borderColor: "#2388FF",
    borderWidth: 2,
    startDataIndex: undefined,
    endDataIndex: undefined,
    text: {
      enable: true,
      color: "#000",
      offset: 0,
      padding: 0,
      font: {
        family: 'Arial',
        size: 13
      }
    }
  }
};