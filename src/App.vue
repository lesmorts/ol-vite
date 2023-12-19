<script>
import HelloWorld from './components/HelloWorld.vue'
import BaseHeader from './components/layouts/BaseHeader.vue';
import BaseSide from './components/layouts/BaseSide.vue';
import {state} from './state/index'

export default {
  components: {
    BaseHeader,
    BaseSide,
    HelloWorld,
  },
  data() {
    return {
      state,
      isMainMap:true,
      isWMTS:false,
    }
  },
  mounted() {
    
  },
  unmounted() {

  },
  methods: {
    
  },
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header style="padding: 0;">
        <BaseHeader></BaseHeader>
      </el-header>
      <el-container class="main-container">
          <BaseSide class="baseSide"></BaseSide>
        <el-main style="padding: 0;">
          <HelloWorld v-if="state.isMainMap"></HelloWorld>
          <WMTS v-if="state.isWMTS"></WMTS>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style>
.common-layout {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0;
}

.el-container {
  display: flex;
  width: 100%;
  height: 100%;
}

</style>
