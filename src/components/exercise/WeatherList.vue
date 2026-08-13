<script setup>
import WeatherCard from './WeatherCard.vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <h3 class="list-title">지역별 날씨 현황</h3>
  <el-empty v-if="items.length === 0" :image-size="80" description="검색 결과가 없습니다." />
  <template v-else>
    <WeatherCard
      v-for="item in items"
      :key="item.id"
      :city-item="item"
      @select-card="(id) => emit('select-card', id)"
      @click-detail="(cityName, status) => emit('click-detail', cityName, status)"
    />
  </template>
</template>

<style scoped>
.list-title {
  margin: 0 0 16px;
  color: #303133;
  font-size: 17px;
}
</style>
