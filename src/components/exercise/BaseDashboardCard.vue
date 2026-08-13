<template>
  <el-card class="base-dashboard-card" shadow="hover">
    <slot></slot>
  </el-card>
</template>

<style scoped>
.base-dashboard-card {
  margin-bottom: 15px;
  border-radius: 12px;
  --el-card-border-color: #e4e7ed;
  --el-card-padding: 18px;
}
</style>
