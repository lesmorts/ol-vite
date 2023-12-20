<script>
import Map from 'ol/Map.js';
import { BingMaps } from 'ol/source';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import { get as getProjection } from 'ol/proj.js';
import { getTopLeft, getWidth } from 'ol/extent.js';
import { defaults as defaultControls} from 'ol/control';
import { state } from '../state/index'


export default {
  name: 'WMTS-map',
  props: {},
  data() {
    return {
      map: null,
      view: null,
      layers: [],
      state,
      projection: getProjection('EPSG:3857'),
      tileSizePixels: 256,
      tileStizeMtrs: null,
      matrixIds: [],
      resolutions: [],
      scalgoToken: 'CC5BF28A7D96B320C7DFBFD1236B5BEB',
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      this.tileStizeMtrs = getWidth(this.projection.getExtent()) / this.tileSizePixels
      for (let i = 0; i <= 14; i++) {
        this.matrixIds[i] = i
        this.resolutions[i] = this.tileStizeMtrs / Math.pow(2, i)
      }
      const tileGrid = new WMTSTileGrid({
        origin: getTopLeft(this.projection.getExtent()),
        resolutions: this.resolutions,
        matrixIds: this.matrixIds,
      });
      const wmtsSource = new WMTS({
        url: 'https://ts2.scalgo.com/olpatch/wmts?token=' + this.scalgoToken,
        layer: 'SRTM_4_1:SRTM_4_1_flooded_sealevels',
        format: 'image/png',
        matrixSet: 'EPSG:3857',
        attributions: [
          '<a href="https://scalgo.com" target="_blank">SCALGO</a>',
          '<a href="https://cgiarcsi.community/data/' +
          'srtm-90m-digital-elevation-database-v4-1"' +
          ' target="_blank">CGIAR-CSI SRTM</a>',
        ],
        tileGrid: tileGrid,
        style: 'default',
        dimensions: {
          'threshold': 100,
        },
      })
      let BingStateLayer = new TileLayer({
        title: 'BingStateLayer',
        source: new BingMaps({
          key: 'AmzdYQAaruRYfFwNTOvbca0Eff6h5_Af8PdRMININk1c-3tcObLxQe_XNwLl38Ow',
          imagerySet: 'Aerial'
        }),
      })
      this.map = new Map({
        target: 'map',
        view: new View({
          projection: this.projection,
          center: [12685603.8, 2578714.7],
          zoom: 12,
          maxZoom: 18,
          minZoom: 3,
        }),
        controls:defaultControls({
          attribution:false,
          zoom:false,
        }),
        layers: [
          BingStateLayer,
          new TileLayer({
            opacity: 0.5,
            source: wmtsSource,
          }),
        ]
      })
      const slider = document.getElementById('slider');
      const updateSourceDimension = function () {
        wmtsSource.updateDimensions({ 'threshold': slider.value });
        document.getElementById('theinfo').innerHTML = slider.value + ' meters';
      };
      slider.addEventListener('input', updateSourceDimension);
      updateSourceDimension();
    }
  },
}
</script>

<template>
  <div class="map" id="map"></div>
  <label>
    Sea-level
    <input id="slider" type="range" value="5" max="100" min="-1">
  </label>
  <span id="theinfo"></span>
  <p>连续改变维度参数（dimension）时平滑的载入图层,演示的图层是全球海平面计算数据。当海平面上升到 x 米的时候，被淹没的地方会被染成蓝色</p>
</template>

<style scoped>
#map {
  width: 100%;
  height: 85%;
}

#slider{
  width: 50%;
}
</style>