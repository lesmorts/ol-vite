<template>
  <el-menu default-active="1" class="el-menu-vertical-demo" :collapse="isCollapse" @open="handleOpen"
    @close="handleClose" default-openeds="3" unique-opened="true">

    <el-menu-item index="1" @click="toggleCollapse()">
      <el-icon>
        <DArrowRight />
      </el-icon>

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
      <el-menu-item index="3-1" @click="drawMessage('pointOn')">&nbsp&nbsp·&nbsp&nbsp&nbsp点</el-menu-item>
      <el-menu-item index="3-2" @click="drawMessage('lineOn')">&nbsp&nbsp|&nbsp&nbsp&nbsp线</el-menu-item>
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
      <el-menu-item index="4-1" @click="measureMessage('LineString')">
        <el-icon>
          <SemiSelect />
        </el-icon>距离</el-menu-item>
      <el-menu-item index="4-2" @click="measureMessage('Polygon')">
        <el-icon>
          <FullScreen />
        </el-icon>面积</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="5">
      <el-icon>
        <Setting />
      </el-icon>
      <template #title>Navigator Four</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts">
import { ref, } from "vue";

import { Circle } from "ol/geom";

import { state } from '../../state'

export default {
  name: 'Side',
  props: {},
  data() {
    return {
      isCollapse: ref(true),
      layerFlag: 'BingStateLayer',
      state,
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

  },
  components: { Circle }
}
</script>

<style scoped>.flex-grow {
  width: 5%;
}</style>