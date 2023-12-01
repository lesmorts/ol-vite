<script lang="ts" setup>
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal">
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
        <el-menu-item index="2-3-2">卫星</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="2-4">
        <template #title>item four</template>
        <el-menu-item index="2-4-1">item one</el-menu-item>
        <el-menu-item index="2-4-2">item two</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="3" disabled>Info</el-menu-item>
    <el-menu-item index="4">Orders</el-menu-item>
   
  </el-menu>
</template>
