<template>
    <div class="map" id="map"></div>
</template>

<script>
import { onMounted } from 'vue'

//import pic1 from './assets/vue.svg' 引入单张图片方法

import { Map, View, Feature, Overlay } from 'ol'
import { Tile, Vector as layerVector } from 'ol/layer'
import TileLayer from 'ol/layer/Tile'
import { OSM, Vector as sourceVector, Cluster, XYZ } from 'ol/source'
import { Point, MultiPoint, LineString, Circle } from 'ol/geom'
import BingMaps from 'ol/source/BingMaps'
import { createStringXY, toStringHDMS } from 'ol/coordinate'
import { transform as transformCoord } from 'ol/proj'
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
import { Style, Text, Fill, Circle as CircleStyle, Stroke } from 'ol/style'
import Icon from 'ol/style/Icon'
import { fromLonLat, toLonLat, transform } from 'ol/proj'
import { boundingExtent, getCenter, getHeight, getWidth } from 'ol/extent'
import {
  never,
  platformModifierKeyOnly,
  primaryAction
} from 'ol/events/condition'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
//引入GeoJSON
import GeoJSON from 'ol/format/GeoJSON'
const initMap = () => {
  const map = new Map({
    target: 'map',
    layers: [
      new Tile({
        source: new XYZ({
          url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
        })
      }),
      new Tile({
        source: new BingMaps({
          key: 'AmzdYQAaruRYfFwNTOvbca0Eff6h5_Af8PdRMININk1c-3tcObLxQe_XNwLl38Ow',
          imagerySet: 'Aerial'
        }),
        visible: false
      }),
    ],
    controls: defaultControls({ attribution: false }).extend([

    ]),
    view: new View({
      center: [12673524.3542, 2587385.6452],
      rotation: -Math.PI / 8,
      zoom: 12.5,
      maxZoom: 18,
      minZoom: 3,
    })
  })

  //一般方法
  const getImageUrl = (name) => {
    return new URL(`./assets/${name}.svg`, import.meta.url).href
  }
  function getGeoJSON(name) {
    return new URL(`./assets/${name}.json`, import.meta.url).href
  }
}
onMounted(() => { initMap() })
</script>
