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
  <p>지역별 날씨 현황</p>
  <WeatherCard
    v-for="item in items"
    :key="item.id"
    :city-item="item"
    @select-card="(id) => emit('select-card', id)"
    @click-detail="(cityName, status) => emit('click-detail', cityName, status)"
  />
  <p v-if="items.length === 0" class="empty-message">
    검색 결과와 일치하는 도시가 없습니다.
  </p>
</template>

<style scoped>
.empty-message {
  padding: 10px 0;
  color: #e74c3c;
  text-align: center;
}
</style>
