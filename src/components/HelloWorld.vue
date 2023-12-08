<script>
import { ref, onMounted, defineComponent, watch } from 'vue'
import { state } from '../state/index'
import { WindLayer } from 'ol-wind'

import { Map, Overlay, View } from 'ol'
import { BingMaps, OSM, XYZ, Vector as VectorSource } from 'ol/source'
import { Point, MultiPoint, LineString, Polygon, Circle } from 'ol/geom'
import { getCenter, getHeight, getWidth } from 'ol/extent'
import { createStringXY, toStringHDMS } from 'ol/coordinate'
import TileLayer from 'ol/layer/Tile'
import { toLonLat, transform as transformCoord } from 'ol/proj'
import { Style, Text, Fill, Circle as CircleStyle, Stroke } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import { getArea, getLength } from 'ol/sphere.js';
import {
  never,
  platformModifierKeyOnly,
  primaryAction
} from 'ol/events/condition'
import {
  DragRotateAndZoom,
  Draw,
  Modify,
  Translate,
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
import Icon from 'ol/style/Icon'

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
      mSourse: null,
      mVector: null,
      mStyle: null,
      mdraw: null,

    }
  },
  watch: {
    'state.overlayMessage': {
      handler(val, oldVal) {
        if (val === 'on') {
          this.addPopup()
          console.log(`newVal:${val}`)
        } else if (val === 'off') {
          this.removeOverlay()
          console.log(`newVal:${val}`)
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
          state.setIsDrawMessage('取消绘图')
        }
        else if (val === 'lineOn') {
          this.map.removeInteraction(this.drwDraw)
          this.addDrawInteraction()
          state.setIsDrawMessage('取消绘图')
        } else if (val === 'polygonOn') {
          this.map.removeInteraction(this.drwDraw)
          this.addDrawInteraction()
          state.setIsDrawMessage('取消绘图')
        } else if (val === 'circleOn') {
          this.map.removeInteraction(this.drwDraw)
          this.addDrawInteraction()
          state.setIsDrawMessage('取消绘图')
        } else {
          this.map.removeInteraction(this.drwDraw)
          state.setIsDrawMessage('')
        }
      },
      deep: true,
    },
    'state.measureMessage': {
      handler(val, oldVal) {
        console.log(`newVal:${val}`)
        if (val === 'length') {

        } else if (val === 'area') {

        }
      },
      deep: true,
    },
  },

  mounted() {
    this.initMap()
    //EventBus组件通信
    const self = this
    this.$bus.on('layerChange', (data) => {
      self.layers.forEach((item) => {
        if (item.values_.title === data) {
          item.setVisible(true)
        } else if (item.values_.title !== 'drwVector') {
          item.setVisible(false)
        }
      })
    })
    this.$bus.on('projectionChange', (data) => {
      if (data === 'EPSG:3857' || data === 'EPSG:4326') {
        self.mousePositionControl.setProjection(data)
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
        minZoom: 5,
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
      this.mSourse = new VectorSource()
      this.mVector = new VectorLayer({
        source: this.mSourse,
        style: {
          'fill-color': 'rgba(255, 255, 255, 0.2)',
          'stroke-color': '#ffcc33',
          'stroke-width': 2,
          'circle-radius': 7,
          'circle-fill-color': '#ffcc33',
        },
      })
      let sketch
      let helpTooltipElement
      let helpTooltip
      let measureTooltipElement
      let measureTooltip
      const continuePolygonMsg = 'Click to continue drawing the polygon'
      const continueLineMsg = 'Click to continue drawing the line'
      const pointerMoveHandler = (evt) => {
        if (evt.dragging) {
          return;
        }
        let helpMsg = 'Click to start drawing';

        if (sketch) {
          const geom = sketch.getGeometry();
          if (geom instanceof Polygon) {
            helpMsg = continuePolygonMsg;
          } else if (geom instanceof LineString) {
            helpMsg = continueLineMsg;
          }
        }
        helpTooltipElement.innerHTML = helpMsg;
        helpTooltip.setPosition(evt.coordinate);

        helpTooltipElement.classList.remove('hidden');
      }
      this.layers.push(this.mVector)
      this.mStyle = new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2,
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        }),
      })









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
      this.map.on('click', this.overlayHandler)
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
        closer.blur()
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
    addMeasure() {
      this.map.on('pointermove', pointerMoveHandler)
      this.map.getViewport().addEventListener('mouseout', function () {
        helpTooltipElement.classList.add('hidden');
      })
    },
    formatLength(line) {
      const length = getLength(line);
      let output;
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
      } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm';
      }
      return output;
    },
    formatArea(polygon) {
      const area = getArea(polygon);
      let output;
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
      } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
      }
      return output;
    },

  },
}

</script>

<template>
  <div class="map" id="map"></div>
  <div id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    <div id="popup-content" class="popup-content"></div>
  </div>
</template>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}

#popup {
  color: #4094ff;
  background: #ecf5ff;
  padding: 0px 9px;
  border-radius: 6px;
}

#popup-closer {
  position: absolute;
  text-decoration: none;
  right: 8px;
  content: none;
}

#popup-closer:active {
  content: 'X';
}
</style>
