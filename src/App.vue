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
      state
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
        <el-aside style="width: auto;">
          <BaseSide class="baseSide"></BaseSide>
        </el-aside>
        <el-main style="padding: 0;">
          <HelloWorld></HelloWorld>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style>
.common-layout {
  position: absolute;
  padding: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.el-container {
  height: 100%;
  width: 100%;
}

.baseSide {
  height: 100%;
}
</style>
