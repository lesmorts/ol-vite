<script>
import { state } from '../state/index'


import { Map, Overlay, View } from 'ol'
import { BingMaps, XYZ, Vector as VectorSource } from 'ol/source'
import { LineString, Polygon } from 'ol/geom'
import { createStringXY, toStringHDMS } from 'ol/coordinate'
import TileLayer from 'ol/layer/Tile'
import { toLonLat, transform as transformCoord } from 'ol/proj'
import { Style, Fill, Circle as CircleStyle, Stroke } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import { getArea, getLength } from 'ol/sphere.js';
import { unByKey } from 'ol/Observable'
import {
  Draw,
  defaults as defaultInteractions,
} from 'ol/interaction'
import {
  FullScreen,
  defaults as defaultControls,
  ZoomSlider,
  MousePosition,
  OverviewMap,
  ScaleLine,
  ZoomToExtent
} from 'ol/control';


var helpTooltipElement = null
var mfeature = null;
var helpTooltip = null;

var measureTooltipElement = null;
var measureTooltip = null;
var mlistener = null;



export default {
  name: 'ol-map',
  props: {},
  data() {
    return {
      view: null,
      map: null,
      vectorSource: null,
      layers: [],
      //状态中心
      state,
      //Controls
      fullScreen: new FullScreen(),
      zoomSlider: new ZoomSlider(),
      zoomtoextent: new ZoomToExtent({
        extent: [
          15437211, 4210102,
          15450282, 4217104,
        ],
      }),
      overviewMapControl: new OverviewMap({
        layers: [new TileLayer({
          source: new XYZ({
            url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
          }),
        })

        ],
        collapseLabel: '\u00BB',
        label: '\u00AB',
        collapsed: false,
      }),
      scaControl: new ScaleLine({
        units: 'metric',
      }),
      mousePositionControl: new MousePosition({
        coordinateFormat: createStringXY(2),
        projection: 'EPSG:4326',
        target: document.getElementById('mouse-position')
      }),
      //Overlay
      overlay: null,
      //Drwaing
      drwDraw: null,
      drwSourse: null,
      drwVector: null,
      //Measure
      drawLayers: [],
      drawElements: [],
      mDraw: null,
    }
  },
  watch: {
    'state.overlayMessage': {
      handler(val) {
        if (val === 'on') {
          this.map.on('click', this.overlayHandler)
          console.log(`popup:${val}`)
        } else if (val === 'off') {
          this.removeOverlay()
          console.log(`popup:${val}`)
        }
      },
      deep: true,
    },
    'state.drawMessage': {
      handler(val, oldVal) {
        console.log(`newVal:${val} oldVal:${oldVal}`)
        if (val === 'pointOn') {
          this.map.removeInteraction(this.drwDraw)
          this.addDrawInteraction()
        }
        else if (val === 'lineOn') {
          this.map.removeInteraction(this.drwDraw)
          this.addDrawInteraction()
        } else if (val === 'polygonOn') {
          this.map.removeInteraction(this.drwDraw)
          this.addDrawInteraction()
        } else if (val === 'circleOn') {
          this.map.removeInteraction(this.drwDraw)
          this.addDrawInteraction()
        } else {
          this.map.removeInteraction(this.drwDraw)
        }
      },
      deep: true,
    },
    'state.measureMessage': {
      handler(val, oldVal) {
        console.log(`newVal:${val} oldVal:${oldVal}`)
        if (val === 'LineStringOn') {
          this.map.removeInteraction(this.mDraw)
          this.Measure()

        } else if (val === 'PolygonOn') {
          this.map.removeInteraction(this.mDraw)
          this.Measure()
        } else {
          this.measureCancel()
        }
      },
      deep: true,
    },
  },

  mounted() {
    this.initMap()
    this.addPopup()
    //EventBus组件通信
    this.$bus.on('layerChange', (data) => {
      this.layers.forEach((item) => {
        if (item.values_.title === data) {
          item.setVisible(true)
        } else if (item.values_.title !== 'drwVector') {
          item.setVisible(false)
        }
      })
    })
    this.$bus.on('projectionChange', (data) => {
      if (data === 'EPSG:3857' || data === 'EPSG:4326') {
        this.mousePositionControl.setProjection(data)
      }
    })


  },

  unmounted() {
    this.$bus.off('layerChange')
    this.$bus.off('projectionChange')
  },

  methods: {
    initMap() {
      let BingStateLayer = new TileLayer({
        title: 'BingStateLayer',
        source: new BingMaps({
          key: 'AmzdYQAaruRYfFwNTOvbca0Eff6h5_Af8PdRMININk1c-3tcObLxQe_XNwLl38Ow',
          imagerySet: 'Aerial'
        }),
      })
      let BingLayer = new TileLayer({
        title: 'BingLayer',
        source: new BingMaps({
          key: 'AmzdYQAaruRYfFwNTOvbca0Eff6h5_Af8PdRMININk1c-3tcObLxQe_XNwLl38Ow',
          imagerySet: 'RoadOnDemand'
        }),
        visible: false,
      })
      let gdLayer = new TileLayer({
        title: 'gdLayer',
        source: new XYZ({
          url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
        }),
        visible: false
      })
      let gdSateLayer = new TileLayer({
        title: 'gdStateLayer',
        source: new XYZ({
          url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}'
        }),
        visible: false
      })
      this.layers.push(BingStateLayer)
      this.layers.push(BingLayer)
      this.layers.push(gdLayer)
      this.layers.push(gdSateLayer)


      this.view = new View({
        center: [12673524.3542, 2587385.6452],
        rotation: -Math.PI / 8,
        zoom: 12.5,
        maxZoom: 18,
        minZoom: 3,
      })



      //draw
      this.drwSourse = new VectorSource({ wrapX: false })
      this.drwVector = new VectorLayer({
        title: 'drwVector',
        source: this.drwSourse,
        style: {
          'fill-color': 'rgba(255, 255, 255, 0.2)',
          'stroke-color': '#ffcc33',
          'stroke-width': 2,
          'circle-radius': 7,
          'circle-fill-color': '#ffcc33',
        },
      })
      this.layers.push(this.drwVector)
      //Measure



      //initialize Map
      this.map = new Map({
        target: 'map',
        layers: this.layers,
        view: this.view,
        controls:
          defaultControls({ attribution: false })
            .extend([
              this.fullScreen,
              this.zoomtoextent,
              this.zoomSlider,
              this.overviewMapControl,
              this.scaControl,
              this.mousePositionControl,
            ]),
        overlays: [],
        interactions: defaultInteractions().extend([

        ])
      })


    },
    //Overlay
    addPopup() {
      var popupContainer = document.getElementById("popup")
      this.overlay = new Overlay({
        element: popupContainer,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
      })
      this.map.addOverlay(this.overlay)

    },
    overlayHandler(evt) {
      var popupCloser = document.getElementById("popup-closer")
      var popupContent = document.getElementById("popup-content")
      let coordinate = evt.coordinate
      const hdms = toStringHDMS(toLonLat(coordinate))
      const stringifyFunc = createStringXY(1)
      const espg3 = stringifyFunc(coordinate).toString()
      const espg4 = stringifyFunc(transformCoord(coordinate, 'EPSG:3857', 'EPSG:4326')).toString();
      popupContent.innerHTML =
        `<span>You clicked here:</span><br>
             lon&lat: <code>` + hdms + `</code><br>
             coord: <br><code>`+ espg3 + `</code>/` + `<code>` + espg4 + `</code>`
      this.overlay.setPosition(evt.coordinate)
      popupCloser.onclick = () => {
        this.overlay.setPosition(undefined)
        popupCloser.blur()
        return false
      }
    },
    removeOverlay() {
      this.overlay.setPosition(undefined)
      this.map.un('click', this.overlayHandler)
    },
    //Drawing
    addDrawInteraction() {
      let value = ''
      if (state.drawMessage === 'pointOn')
        value = 'Point'
      else if (state.drawMessage === 'lineOn')
        value = 'LineString'
      else if (state.drawMessage === 'polygonOn')
        value = 'Polygon'
      else if (state.drawMessage === 'circleOn')
        value = 'Circle'

      if (value !== 'Drawing') {
        this.drwDraw = new Draw({
          source: this.drwSourse,
          type: value,
        })
        this.map.addInteraction(this.drwDraw)
      }
    },

    //Measure
    Measure() {
      let value = ''
      if (state.measureMessage === 'LineStringOn')
        value = 'LineString'
      else if (state.measureMessage === 'PolygonOn')
        value = 'Polygon'
      let source = new VectorSource()
      const layer = new VectorLayer({
        source: source,
        style: new Style({
          fill: new Fill({
            color: 'rgba(66, 161, 255,0.2)',
          }),
          stroke: new Stroke({
            color: 'rgb(66, 161, 255)',
            width: 4,
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: 'rgba(66, 161, 255,0.2)',
            }),
          }),
        }),
      });

      this.map.on('pointermove', this.measureHandler)

      this.map.getViewport().addEventListener('mouseout', function () {
        helpTooltipElement.classList.add('hidden');
      });

      this.mDraw = new Draw({
        source,
        type: value,
        style: new Style({
          fill: new Fill({
            color: 'rgba(66, 161, 255,0.2)',
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 4,
          }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
              color: 'rgba(66, 161, 255,0.7)',
            }),
            fill: new Fill({
              color: 'rgba(66, 161, 255,0.2)',
            }),
          }),
        }),
      });

      // 开始绘制
      this.mDraw.on('drawstart', (evt) => {
        mfeature = evt.feature;

        let tooltipCoord = evt.coordinate;

        mlistener = mfeature.getGeometry().on('change', function (evt) {
          const geom = evt.target;
          let output
          if (geom instanceof Polygon) {
            output = formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }
          tooltipCoord = geom.getLastCoordinate();
          measureTooltipElement.innerHTML = output;
          measureTooltip.setPosition(tooltipCoord);
        });
      });

      // 双击绘制完成
      this.mDraw.on('drawend', () => {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        mfeature = null;
        measureTooltipElement = null;
        this.createMeasureTooltip();
        unByKey(mlistener);
      });

      // 格式化长度
      const formatLength = function (line) {
        const length = getLength(line);
        let output;
        if (length > 100) {
          output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
        } else {
          output = Math.round(length * 100) / 100 + ' ' + 'm';
        }
        return output;
      };
      const formatArea = function (polygon) {
        const area = getArea(polygon);
        let output;
        if (area > 10000) {
          output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
        } else {
          output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
        }
        return output;
      };

      this.createHelpTooltip()
      this.createMeasureTooltip()
      this.map.addLayer(layer)
      this.drawLayers.push(layer)
      this.map.addInteraction(this.mDraw);
    },
    measureHandler(ev) {
      let helpMsg = '点击开始测量'
      if (mfeature) {
        helpMsg = '双击结束测量'
      }
      helpTooltipElement.innerHTML = helpMsg;
      helpTooltip.setPosition(ev.coordinate);
      helpTooltipElement.classList.remove('hidden')
    },
    createMeasureTooltip() {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement('div');
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
      measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
        stopEvent: false,
        insertFirst: false,
      });
      this.drawElements.push(measureTooltip)
      this.map.addOverlay(measureTooltip);
    },

    createHelpTooltip() {
      if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
      }
      helpTooltipElement = document.createElement('div');
      helpTooltipElement.className = 'ol-tooltip hidden';
      helpTooltip = new Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
      });
      this.map.addOverlay(helpTooltip);
    },
    measureCancel() {
      helpTooltip.setPosition(undefined)
      this.map.removeInteraction(this.mDraw)
      this.map.un('pointermove', this.measureHandler)
    },
    getGeoJSON(name) {
      return new URL(`./assets/${name}.json`, import.meta.url).href
    }
  },
}

</script>

<template>
  <div class="map" id="map"></div>
  <div id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer">X</a>
    <div id="popup-content" class="popup-content"></div>
  </div>
</template>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}

#popup {
  padding: 0 9px;
  color: #4094ff;
  background: #ecf5ff;
  border-radius: 6px;
}

#popup-closer {
  position: absolute;
  right: 8px;
  text-decoration: none;
  content: none;
}

#popup-closer:active {
  content: 'X';
}
</style>
