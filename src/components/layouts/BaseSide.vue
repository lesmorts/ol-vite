<template>
  <el-menu default-active="1" class="el-menu-vertical-demo" :collapse="isCollapse" @open="handleOpen" @close="handleClose"
     :unique-opened="true">

    <el-menu-item index="1" @click="toggleCollapse()">
      <el-icon>
        <DArrowRight />
      </el-icon> 
    </el-menu-item>
    <el-menu-item @click="OverlayChange()">
      <el-icon>
        <Location />
      </el-icon>
      <span class="overlay-title">overlay标注</span>
    </el-menu-item>
    <el-sub-menu index="2">
      <template #title>
        <el-icon>
          <Grid />
        </el-icon>
        <span>图层切换</span>
      </template>
      <el-menu-item-group title="高德">
        <el-menu-item index="2-1" @click="layerchange('gdStateLayer');">卫星</el-menu-item>
        <el-menu-item index="2-2" @click="layerchange('gdLayer')">街道</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group title="BingMap">
        <el-menu-item index="2-3" @click="layerchange('BingStateLayer')">卫星</el-menu-item>
        <el-menu-item index="2-4" @click="layerchange('BingLayer')">街道</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>
    <el-sub-menu index="3">
      <template #title>
        <el-icon>
          <EditPen />
        </el-icon>
        <span>绘图</span>
      </template>
      <el-menu-item index="3-1" @click="drawMessage('pointOn')">&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;点</el-menu-item>
      <el-menu-item index="3-2" @click="drawMessage('lineOn')">&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;线</el-menu-item>
      <el-menu-item index="3-3" @click="drawMessage('polygonOn')"><el-icon>
          <House />
        </el-icon>多边形</el-menu-item>
      <el-menu-item index="3-4" @click="drawMessage('circleOn')"><el-icon>
          <Aim />
        </el-icon>圆</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="4">
      <template #title>
        <el-icon>
          <Memo />
        </el-icon>
        <span>测量</span>
      </template>
      <el-menu-item index="4-1" @click="measureMessage('LineStringOn')">
        <el-icon>
          <SemiSelect />
        </el-icon>距离</el-menu-item>
      <el-menu-item index="4-2" @click="measureMessage('PolygonOn')">
        <el-icon>
          <FullScreen />
        </el-icon>面积</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="5">
      <template #title>
        <el-icon>
          <Memo />
        </el-icon>
        <span>
          高级功能
        </span>
      </template>
      <el-menu-item index="5-1">
        <el-icon>
          <SemiSelect />
        </el-icon>
        投影转换
      </el-menu-item>
      <el-menu-item index="5-2">
        <el-icon>
          <FullScreen />
        </el-icon>
        定位导航
      </el-menu-item>
      <el-menu-item index="5-3">
        <el-icon>
          <FullScreen />
        </el-icon>
        热点图
      </el-menu-item>
      <el-menu-item index="5-4">
        <el-icon>
          <FullScreen />
        </el-icon>
        热区图
      </el-menu-item>
      <el-menu-item index="5-5">
        <el-icon>
          <FullScreen />
        </el-icon>
        统计图
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item index="6">
      <el-icon>
        <Setting />
      </el-icon>
      <template #title>Navigator Four</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts">
import { ref, } from "vue";


import { state } from '../../state'

export default {
  name: 'baseSide',
  props: {},
  data() {
    return {
      isCollapse: ref(true),
      layerFlag: 'BingStateLayer',
      state,
      opends: [2],
    };
  },
  mounted() {

  },
  methods: {
    handleOpen(key: string, keyPath: string[]) {
      console.log(key, keyPath);
    },
    handleClose(key: string, keyPath: string[]) {
      console.log(key, keyPath);
    },
    layerchange(option: string) {
      this.layerFlag = option;
      this.$bus.emit('layerChange', this.layerFlag)
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    drawMessage(msg: string) {
      this.state.setDrawMessage(msg)
    },
    measureMessage(msg: string) {
      this.state.setMesureMessage(msg)
    },
    OverlayChange() {
      if (state.overlayMessage === 'off') {
        state.setOverlayMessage('on')
      } else {
        state.setOverlayMessage('off')
      }
    },
  },
}
</script>

<style scoped>
.flex-grow {
  width: 5%;
}
</style>