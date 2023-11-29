<script setup>
import { onMounted } from 'vue'

//import pic1 from './assets/vue.svg' 引入单张图片方法

import { Map, View, Feature, Overlay } from 'ol'
import { Tile, Vector as layerVector } from 'ol/layer'
import TileLayer from 'ol/layer/Tile'
import { OSM, Vector as sourceVector, Cluster } from 'ol/source'
import { Point, MultiPoint, LineString, Circle } from 'ol/geom'
import BingMaps from 'ol/source/BingMaps'
import { createStringXY, toStringHDMS } from 'ol/coordinate'
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

  //控件
  const zoomslider = new ZoomSlider()
  const fullScreen = new FullScreen()
  const zoomtoextent = new ZoomToExtent({
    extent: [813079.7791264898, 5929220.284081122, 848966.9639063801,
      5936863.986909639,
    ],
  })

  const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(4),
    
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
  })

  const overviewMapControl = new OverviewMap({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      new TileLayer({
        source: new BingMaps({
          key: 'AmzdYQAaruRYfFwNTOvbca0Eff6h5_Af8PdRMININk1c-3tcObLxQe_XNwLl38Ow',
          imagerySet: 'Aerial'
        }),
        visible: false
      }),
    ],
    collapseLabel: '\u00BB',
    label: '\u00AB',
    collapsed: false,
  })



  
  //比例尺
  const scaleBarOptionsContainer = document.getElementById('scaleBarOptions');
  const unitsSelect = document.getElementById('units');
  const typeSelect = document.getElementById('type');
  const stepsRange = document.getElementById('steps');
  const scaleTextCheckbox = document.getElementById('showScaleText');
  const invertColorsCheckbox = document.getElementById('invertColors');
  let scacontrol;
  function scaleControl() {
    if (typeSelect.value === 'scaleline') {
      scacontrol = new ScaleLine({
        units: unitsSelect.value,
      });
      scaleBarOptionsContainer.style.display = 'none';
    } else {
      scacontrol = new ScaleLine({
        units: unitsSelect.value,
        bar: true,
        steps: parseInt(stepsRange.value, 10),
        text: scaleTextCheckbox.checked,
        minWidth: 140,
      });
      onInvertColorsChange();
      scaleBarOptionsContainer.style.display = 'block';
    }
    return scacontrol;
  }

  
  //功能

  //标注
  const vectorSource = new sourceVector()
  const vectorLayer = new layerVector({
    source: vectorSource
  });
  // 用于充当标注的要素
  let labelFeature = new Feature()
  // 设置标注的样式
  let labelStyle = new Style();

  //overlay标注
  const popContainer = document.getElementById('popup');
  const popContent = document.getElementById('popup-content');
  const popCloser = document.getElementById('popup-closer');
  const overlay = new Overlay({
    element: popContainer,
    autoPan: {
      duration: 25,
    }
  })
  popCloser.onclick = function () {
    overlay.setPosition(undefined)
    return false
  }
  //机场标注
  const pos = fromLonLat([113.819925, 22.632543])
  const airport = new Overlay({
    position: pos,
    element: document.getElementById('airport')
  })
  const marker = new Overlay({
    position: pos,
    positioning: 'center-center',
    element: document.getElementById('marker'),
    stopEvent: false,
  });

  //聚合标注
  const clusterFeatures = [
    new Feature(new Point([114.045292, 22.555131])),
    new Feature(new Point([114.084222, 22.571744])),
    new Feature(new Point([113.937208, 22.570083])),
    new Feature(new Point([113.962505, 22.583966])),
  ]
  const clusterSource = new VectorSource({
    features: clusterFeatures
  })
  const cluster = new Cluster({
    distance: parseInt(20, 10),
    source: clusterSource
  })
  const clusterLayer = new VectorLayer({
    source: cluster,
    style: (feature) => {
      const size = feature.get('features').length
      const style = new Style({
        image: new Circle({
          radius: 15,
          stroke: new Stroke({
            color: '#fff'
          }),
          fill: new Fill({
            color: '#3399CC'
          }),
        }),
        text: new Text({
          font: '15px sans-serif',
          text: size.toString(),
          fill: new Fill({
            color: '#fff'
          })
        })
      })
      return style
    }
  })

  //绘图

  const drawSource = new VectorSource();
  //设置绘图样式
  const drawStyle = new Style({
    geometry: function (feature) {
      const modifyGeometry = feature.get('modifyGeometry')
      return modifyGeometry ? modifyGeometry.geometry : feature.getGeometry();
    },
    fill: new Fill({
      color: 'rgba(255,25,255,0.2)',
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33',
      }),
    }),
  })

  function caculateCenter(geometry) {
    let center, coordinates, minRadius
    const type = geometry.getType()
    if (type === 'Polygon') {
      let x = 0
      let y = 0
      let i = 0
      coordinates = geometry.getCoordinates()[0].slice(1)
      coordinates.forEach(function (coordinate) {
        x += coordinate[0]
        y += coordinate[1]
        i++
      })
      center = [x / i, y / i]
    } else if (type === 'LineString') {
      center = geometry.getCoordinateAt(0.5)
      coordinates = geometry.getCoordinates()
    } else { center = getCenter(geometry.getExtent()) }
    let sqDistances
    if (coordinates) {
      sqDistances = coordinates.map(function (coordinate) {
        const dx = coordinate[0] - center[0]
        const dy = coordinate[1] - center[1]
        return dx * dx + dy * dy
      })
      minRadius = Math.sqrt(Math.max.apply(Math, sqDistances)) / 3
    } else {
      minRadius =
        Math.max(
          getWidth(geometry.getExtent()),
          getHeight(geometry.getExtent())
        ) / 3
    }
    return {
      center: center,
      coordinates: coordinates,
      minRadius: minRadius,
      sqDistances: sqDistances,
    }
  }

  const drawVector = new VectorLayer({
    source: drawSource,
    style: function (feature) {
      const styles = [drawStyle]
      const modifyGeometry = feature.get('modifyGeometry')
      const geometry = modifyGeometry ? modifyGeometry.geometry : feature.getGeometry()
      const result = caculateCenter(geometry)
      const center = result.center
      if (center) {
        styles.push(
          new Style({
            geometry: new Point(center),
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({
                color: '#ff3333'
              }),
            }),
          })
        )
        const coordinates = result.coordinates
        if (coordinates) {
          const minRadius = result.minRadius
          const sqDistances = result.sqDistances
          const rsq = minRadius * minRadius
          const points = coordinates.filter(function (coordinate, index) {
            return sqDistances[index] > rsq
          })
          styles.push(
            new Style({
              geometry: new MultiPoint(points),
              image: new CircleStyle({
                radius: 4,
                fill: new Fill({
                  color: '#33cc33'
                }),
              }),
            })
          )
        }
      }
      return styles
    }
  })

  const defaultStyle = new Modify({ source: drawSource })
    .getOverlay()
    .getStyleFunction()

  const modify = new Modify({
    source: drawSource,
    condition: (event) => {
      return primaryAction(event) && !platformModifierKeyOnly(event)
    },
    deleteCondition: never,
    insertVertexCondition: never,
    style: (feature) => {
      feature.get('features').forEach((modifyFeature) => {
        const modifyGeometry = modifyFeature.get('modifyGeometry')
        if (modifyGeometry) {
          const point = feature.getGeometry().getCoordinates()
          let modifyPoint = modifyGeometry.point
          if (!modifyPoint) {
            //保存初始几何形状与顶点位置
            modifyPoint = point
            modifyGeometry.point = modifyPoint
            modifyGeometry.geometry0 = modifyGeometry.geometry
            //获取锚点与顶点最小半径
            const result = caculateCenter(modifyGeometry.geometry0)
            modifyGeometry.center = result.center
            modifyGeometry.minRadius = result.minRadius
          }

          const center = modifyGeometry.center
          const minRadius = modifyGeometry.minRadius
          let dx, dy
          dx = modifyPoint[0] - center[0]
          dy = modifyPoint[1] - center[1]
          const initialRadius = Math.sqrt(dx * dx + dy * dy)
          if (initialRadius > minRadius) {
            const initialAngle = Math.atan2(dy, dx)
            dx = point[0] - center[0]
            dy = point[1] - center[1]
            const currentRadius = Math.sqrt(dx * dx + dy * dy)
            if (currentRadius > 0) {
              const currentAngle = Math.atan2(dy, dx)
              const geometry = modifyGeometry.geometry0.clone()
              geometry.scale(currentRadius / initialRadius, undefined, center)
              geometry.rotate(currentAngle - initialAngle, center)
              modifyGeometry.geometry = geometry
            }
          }
        }
      })
      return defaultStyle(feature)
    }
  })
  modify.on('modifystart', function (event) {
    event.features.forEach(function (feature) {
      feature.set(
        'modifyGeometry',
        { geometry: feature.getGeometry().clone() },
        true
      );
    });
  });

  modify.on('modifyend', function (event) {
    event.features.forEach(function (feature) {
      const modifyGeometry = feature.get('modifyGeometry');
      if (modifyGeometry) {
        feature.setGeometry(modifyGeometry.geometry);
        feature.unset('modifyGeometry', true);
      }
    });
  });

  //数据
  const GEOJSON_CONST = getGeoJSON('shenzhen')
  const geoVectorSource = new VectorSource({
    url: GEOJSON_CONST,
    format: new GeoJSON()
  })
  const geoVectorLayer = new VectorLayer({
    source: geoVectorSource
  })

  //主地图
  const map = new Map({
    target: 'map',
    layers: [
      new Tile({
        source: new OSM()
      }),
      new Tile({
        source: new BingMaps({
          key: 'AmzdYQAaruRYfFwNTOvbca0Eff6h5_Af8PdRMININk1c-3tcObLxQe_XNwLl38Ow',
          imagerySet: 'Aerial'
        }),
        visible: false
      }),
      drawVector,
      
    ],
    controls: defaultControls({ attribution: false }).extend([
      overviewMapControl,
      mousePositionControl,
      fullScreen,
      zoomslider,
      zoomtoextent,
      scaleControl(),
    ]),
    interactions: defaultInteractions().extend([
      new DragRotateAndZoom(),
    ]),
    overlays: [airport, marker],
    view: new View({
      
      center: [13526041.708072895 , 3664472.687460804],
      rotation: -Math.PI / 8,
      zoom: 12.5,
      maxZoom: 18,
      minZoom: 3,
    })
  })

  map.addInteraction(modify)
  map.addInteraction(
    new Translate({
      condition: (event) => {
        return primaryAction(event) && platformModifierKeyOnly(event)
      },
      layers: [drawVector]
    })
  )

  //一般方法
  const getImageUrl = (name) => {
    return new URL(`./assets/${name}.svg`, import.meta.url).href
  }
  function getGeoJSON(name) {
    return new URL(`./assets/${name}.json`, import.meta.url).href
  }

  const clusterClickHandle = (e) => {
    clusterLayer.getFeatures(e.pixel).then((clickedFeatures) => {
      if (clickedFeatures.length) {
        const features = clickedFeatures[0].get('features')
        if (features.length > 1) {
          const extent = boundingExtent(
            features.map((r) => r.getGeometry().getCoordinates())
          )
          let [width, height] = map.getSize()
          width = Math.ceil(width)
          height = Math.ceil(height / 5)
          map.getView().fit(extent, {
            duration: 500,
            padding: [height, width, height, width + 500]
          })
        }
      }
    })
  }

  //绘图
  let draw
  const addInteractions = (value) => {
    draw = new Draw({
      source: drawSource,
      type: value
    })
    map.addInteraction(draw)
  }

  //窗口监听事件
  const projectionSelect = document.getElementById('projection')
  projectionSelect.addEventListener('change', function (event) {
    mousePositionControl.setProjection(event.target.value)
  })

  const precisionInput = document.getElementById('precision')
  precisionInput.addEventListener('change', function (OPevent) {
    const format = createStringXY(event.target.valueAsNumber)
    mousePositionControl.setCoordinateFormat(format)
  })

  const rotateWithView = document.getElementById('rotateWithView')
  rotateWithView.addEventListener('change', function () {
    overviewMapControl.setRotateWithView(this.checked);
  })

  //比例尺样式转换
  unitsSelect.addEventListener('change', onChangeUnit);
  typeSelect.addEventListener('change', reconfigureScaleLine);
  stepsRange.addEventListener('input', reconfigureScaleLine);
  scaleTextCheckbox.addEventListener('change', reconfigureScaleLine);
  invertColorsCheckbox.addEventListener('change', onInvertColorsChange);
  function reconfigureScaleLine() {
    map.removeControl(scacontrol);
    map.addControl(scaleControl());
  }
  function onChangeUnit() {
    scacontrol.setUnits(unitsSelect.value);
  }
  function onInvertColorsChange() {
    scacontrol.element.classList.toggle(
      'ol-scale-bar-inverted',
      invertColorsCheckbox.checked
    );
  }

  //添加标注
  const changeFeature = document.getElementById('showFeature')
  let n = 0;
  changeFeature.addEventListener('click', (e) => {
    const t = e.target;
    switch (t.id) {
      case "textFeature":
        if (!map.getLayers().item(3)) {
          vectorLayer.getSource().removeFeature(labelFeature)
          labelFeature = new Feature({
            geometry: new Point([12956325, 4851028])
          })
          labelStyle = new Style({
            text: new Text({
              font: 'bold 20px serif',
              text: '北京',
              fill: new Fill({
                color: 'rgba(255, 0, 0, 1)'
              })
            })
          })
          labelFeature.setStyle(labelStyle)
          vectorLayer.getSource().addFeature(labelFeature)
          map.addLayer(vectorLayer)
          n = 1
        }
        else {
          map.removeLayer(vectorLayer)
          if (n != 1) {
            vectorLayer.getSource().removeFeature(labelFeature)
            labelFeature = new Feature({
              geometry: new Point([12956325, 4851028])
            })
            labelStyle = new Style({
              text: new Text({
                font: 'bold 20px serif',
                text: '北京',
                fill: new Fill({
                  color: 'rgba(255, 0, 0, 1)'
                })
              })
            })
            labelFeature.setStyle(labelStyle)
            vectorLayer.getSource().addFeature(labelFeature)
            map.addLayer(vectorLayer)
            n = 1
          }

        }
        break
      case "picFeature":
        if (!map.getLayers().item(3)) {
          vectorLayer.getSource().removeFeature(labelFeature)
          labelFeature = new Feature({
            geometry: new Point([12956325, 4851028])
          })
          labelStyle = new Style({
            image: new Icon({
              src: getImageUrl('error')
            })
          })

          labelFeature.setStyle(labelStyle)
          vectorLayer.getSource().addFeature(labelFeature)
          map.addLayer(vectorLayer)
          n = 0
        }
        else {
          map.removeLayer(vectorLayer)
          if (n != 0) {
            vectorLayer.getSource().removeFeature(labelFeature)
            labelFeature = new Feature({
              geometry: new Point([12956325, 4851028])
            })
            labelStyle = new Style({
              image: new Icon({
                src: getImageUrl('error')
              })
            })

            labelFeature.setStyle(labelStyle)
            vectorLayer.getSource().addFeature(labelFeature)
            map.addLayer(vectorLayer)
            n = 0
          }
        }

        break
      case "clusterFeature":
        map.on('click', clusterClickHandle)
        break
      case "overlay":
        if (!map.getOverlays().item(2)) {
          map.addOverlay(overlay)
          map.on('singleclick', function (evt) {
            const coordinate = evt.coordinate
            const hdms = toStringHDMS(toLonLat(coordinate))
            popContent.innerHTML = `<p>You clicked here:</p><code>` + hdms + `</code>`
            overlay.setPosition(coordinate)
          })
        }
        else map.removeOverlay(overlay)
        break
      default: break
    }
  })

  //图层转换
  const changeLayer = document.getElementById('mapSwitch')
  changeLayer.addEventListener('click', (e) => {
    const t = e.target
    switch (t.id) {
      case "normal":
        map.getLayers().item(0).setVisible(true)
        map.getLayers().item(1).setVisible(false);
        overviewMapControl.getMap().getLayers().item(0).setVisible(true)
        overviewMapControl.getMap().getLayers().item(1).setVisible(false)
        break
      case "mix":
        map.getLayers().item(1).setVisible(true);
        map.getLayers().item(0).setVisible(false);
        overviewMapControl.getMap().getLayers().item(1).setVisible(true)
        overviewMapControl.getMap().getLayers().item(0).setVisible(false)
        break
      default: break
    }
  })

  //绘图
  const changedraw = document.getElementById('drawFeature')
  let dn = 0;
  changedraw.addEventListener('click', (e) => {
    const t = e.target
    switch (t.id) {
      case 'point':
        if (!map.getInteractions().item(1)) {
          addInteractions('Point')
          dn = 1
        }
        else {
          map.removeInteraction(draw)
          if (dn != 1) {
            addInteractions('Point')
            dn = 1
          }
        }
        break
      case 'polyLine':
        if (!map.getInteractions().item(1)) {
          addInteractions('LineString')
          dn = 2
        }
        else {
          map.removeInteraction(draw)
          if (dn != 2) {
            addInteractions('LineString')
            dn = 2
          }
        }
        break
      case 'polygon':
        if (!map.getInteractions().item(1)) {
          addInteractions('Polygon')
          dn = 3
        }
        else {
          map.removeInteraction(draw)
          if (dn != 3) {
            addInteractions('Polygon')
            dn = 3
          }
        }
        break
      case 'Circle':
        if (!map.getInteractions().item(1)) {
          addInteractions('Circle')
          dn = 4
        }
        else {
          map.removeInteraction(draw)
          if (dn != 4) {
            addInteractions('Circle')
            dn = 4
          }
        }
        break
      default: break
    }
  })

  //数据
  const changeData = document.getElementById('addData')
  let d = 0
  changeData.addEventListener('click', (e) => {
    const t = e.target
    switch (t.id) {
      case 'geojson':
        if (d === 0) {
          map.addLayer(geoVectorLayer)
          d = 1
        } else {
          map.removeLayer(geoVectorLayer)
          d = 0
        }
        break
      default: break
    }
  })
}

onMounted(() => { initMap() })

</script>

<template>
  <div class="container">
    <div class="map" id="map"></div>
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-content"></div>
    </div>
    <div style="display: none;">
      <a href="https://www.szairport.com/" class="overlay" id="airport" target="_blank">机场</a>
      <div id="marker" title="Marker"></div>
    </div>
    <div id="mouse-position"></div>

    <div id="controls">
      <form id="Projection">
        <span>坐标：</span>
        <label for="projection">Projection </label>
        <select id="projection">
          <option value="EPSG:4326">EPSG:4326</option>
          <option value="EPSG:3857">EPSG:3857</option>
        </select>
        <label for="precision">Precision</label>
        <input id="precision" type="number" min="0" max="12" value="4" />
      </form><br>

      <div id="Overview">
        <span>鹰眼：</span>
        <label>
          <input type="checkbox" id="rotateWithView">
          Rotate with view
        </label>
      </div><br>

      <div id="Scale">
        <span>比例尺：</span>
        <label for="units">Units:</label>
        <select id="units">
          <option value="degrees">degrees</option>
          <option value="imperial">imperial inch</option>
          <option value="us">us inch</option>
          <option value="nautical">nautical mile</option>
          <option value="metric" selected>metric</option>
        </select>
        <label for="type">Type:</label>
        <select id="type">
          <option value="scaleline">ScaleLine</option>
          <option value="scalebar">ScaleBar</option>
        </select>

        <div id="scaleBarOptions">
          <label for="steps">Steps:</label>
          <input id="steps" type="range" value="4" min="1" max="8">

          <label><input type="checkbox" id="showScaleText" checked> Show scale text</label>

          <label><input type="checkbox" id="invertColors"> Invert colors</label>
        </div>
      </div><br>

      <div id="mapSwitch">
        <span>图层：</span>
        <a href="#" id="normal">地图</a>
        <a href="#" id="mix">混合</a>
      </div><br>

      <div id="showFeature">
        <span>标注：</span>
        <a href="#" id="textFeature">文字标注</a>
        <a href="#" id="picFeature">图片标注</a>
        <a href="" id="clusterFeature">聚合标注</a>
        <a href="#" id="overlay">获取经纬度</a>
      </div><br>

      <div id="drawFeature">
        <span>绘图：</span>
        <a href="#" id="point">点</a>
        <a href="#" id="polyLine">线</a>
        <a href="#" id="polygon">面</a>
        <a href="#" id="Circle">圆</a>
      </div><br>

      <div id="addData">
        <span>数据：</span>
        <a href="#" id="geojson">GeoJSON</a>
      </div>

    </div>
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 780px;
}

#controls {
  position: absolute;
  top: 40%;
  background: #e4f9fb83;
  padding-left: 5px;
  border-radius: 3px;
  height: 400px;
}

#controls a {
  padding: .25em;
  margin: .25em;
  border: 1px solid black;
  border-radius: 9px;
  text-align: center;
  text-decoration: none;
  color: black;
}

#controls a:hover {
  color: aliceblue;
  background-color: rgb(0, 71, 122);
}


#marker {
  width: 20px;
  height: 20px;
  border: 1px solid #088;
  border-radius: 10px;
  background-color: #0FF;
  opacity: 0.5;
}

#airport {
  text-decoration: none;
  color: white;
  font-size: 11pt;
  font-weight: bold;
  text-shadow: black 0.1em 0.1em 0.2em;
  border: 0;
}
</style>
