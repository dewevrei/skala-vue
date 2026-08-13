<script setup>
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()
</script>
<template>
  <div class="unit-toggler">
    <span class="unit-label">날씨 단위</span>
    <el-switch
      :model-value="configStore.unit === 'fahrenheit'"
      active-text="화씨(℉)"
      inactive-text="섭씨(℃)"
      @change="configStore.toggleUnit"
    />
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  white-space: nowrap;
}

.unit-label {
  color: #606266;
  font-size: 14px;
  font-weight: 700;
}
</style>
