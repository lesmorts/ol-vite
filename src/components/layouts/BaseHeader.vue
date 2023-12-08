<script lang="ts">
import { createStringXY, toStringHDMS } from 'ol/coordinate'
import {
  FullScreen,
  defaults as defaultControls,
  ZoomSlider,
  MousePosition,
  OverviewMap,
  ScaleLine,
  ZoomToExtent
} from 'ol/control';
import mousePositionControl from '../HelloWorld.vue';
import { defineComponent } from 'vue'
import { state } from '../../state/index'
import { ref, shallowRef } from 'vue'
import { Sunny, Moon, Check, Close } from '@element-plus/icons-vue'
import { toggleDark, isDark } from '../../composables'

export default {
  props: [],
  data() {
    return {
      value1: shallowRef(false),
      proflag: 'EPSG:4326',
      overlayState: 'off',
      state,
      isDark,
      toggleDark,
      isdraw: '',
    }
  },
  watch: {
    value1: 'toggleDark',
    'state.isDrawMessage': {
      handler(val, oldVal) {
        this.isdraw = val
      },
      deep: true,
    },
  },
  mounted() {
    this.testTheme()
  },
  unmounted() {

  },
  methods: {
    projectionChange(option: string) {
      this.proflag = option
      this.$bus.emit('projectionChange', this.proflag)
    },
    OverlayChange() {
      if (state.overlayMessage === 'off') {
        state.setOverlayMessage('on')
      } else {
        state.setOverlayMessage('off')
      }
    },
    testTheme() {
      if (this.isDark) {
        toggleDark()
      }
    },
    offDraw() {
      state.setDrawMessage('off')
    },

  },

}


</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal" default-active="1" ellipsis="false">
    <el-menu-item index="1">Openplayer-Vite</el-menu-item>
    <el-sub-menu index="2">
      <template #title>图层</template>
      <el-sub-menu index="2-1">
        <template #title>百度</template>
        <el-menu-item index="2-1-1">街道</el-menu-item>
        <el-menu-item index="2-1-2">卫星</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="2-2">
        <template #title>高德</template>
        <el-menu-item index="2-2-1">街道</el-menu-item>
        <el-menu-item index="2-2-2">卫星</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="2-3">
        <template #title>BingMap</template>
        <el-menu-item index="2-3-1">街道</el-menu-item>
        <el-menu-item index="2-3-2" @click="">卫星</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="2-4">
        <template #title>item four</template>
        <el-menu-item index="2-4-1">item one</el-menu-item>
        <el-menu-item index="2-4-2">item two</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-switch v-model="value1" class="mt-1" size="large"
      style="--el-switch-on-color:#409eff ; --el-switch-off-color: #bcdbff;top: 13%;" inline-prompt active-text="夜"
      inactive-text="日" />
    <div id="flex-grow"></div>
    <el-menu-item index="3" @click="offDraw()">
      <span>{{ isdraw }}</span></el-menu-item>
    <el-menu-item @click="OverlayChange()">
      <el-icon>
        <Location />
      </el-icon>
      <span class="overlay-title">overlay标注</span>
    </el-menu-item>

    <el-sub-menu index="4">
      <template #title>坐标</template>
      <el-menu-item-group title="Projection">
        <el-menu-item index="4-1" @click="projectionChange('EPSG:3857')">EPSG:3857</el-menu-item>
        <el-menu-item index="4-2" @click="projectionChange('EPSG:4326')">EPSG:4326</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>

    <el-sub-menu index="5">
      <template #title>设置</template>
      <el-menu-item-group title="Setting">
        <el-menu-item index="5-1">隐藏绘图</el-menu-item>
        <el-menu-item index="5-2">隐藏测量</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>

  </el-menu>
</template>

<style scoped>
#flex-grow {
  flex-grow: 1;
}

.pro {
  padding: 4px;
}
</style>
