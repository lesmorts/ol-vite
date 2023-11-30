### Openlayer实现

图层个数：

默认：

1. OSM Tile
2. BingMaps Tile
3. drawVector Vector

可添加

1. GeoJSON Vector

#### 控件

已添加

1. FullScreen
2. Customized ZoomSlider
3. MousePositionControl
4. Customized OverviewMapControl
5. ScaleLine
6. ZoomToExtent

#### 数据对接

1. 基础数据
   1. 
2. 开放数据
   1. GeoJSON
   2. KML
   3. GPX
3. 公共地图
   1. 高德地图
   2. Bing地图
   3. 百度地图

#### 功能(未更换CSS样式)

1. 图层切换（涉及JS中事件委托）

2. 地图标注

   1. 使用Feature标注（涉及JS中事件委托）
      - 文字标注
      - 图片标注(涉及VIte中本地静态资源管理)
      - 聚合标注
   2. 使用overlay标注

3. 弹窗(use overplay)

4. 绘图

5. 投影转换

   


