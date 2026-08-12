<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  cityItem: { type: Object, required: true },
})

const emit = defineEmits(['select-card', 'click-detail'])

const configStore = useConfigStore()
// 스토어의 상태값이 fahrenheit일 때만 화씨 공식 적용 연산
const displayTemp = computed(() => {
  const rawTemp = props.cityItem.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp // 'celsius'일 때는 원본 그대로 반환
})
</script>

<template>
  <section class="weather-card" @click="emit('select-card', cityItem.id)">
    <p>{{ cityItem.name }} {{ cityItem.status }}</p>
    <p>현재 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>

    <span class="badge hot" v-if="cityItem.temp >= 25">🔥 더움 (25도 이상)</span>
    <span class="badge cool" v-else>❄️ 선선함 (25도 미만)</span>
    <button class="btn-detail" @click.stop="emit('click-detail', cityItem.name, cityItem.status)">
      상세보기
    </button>
  </section>
</template>

<style scoped>
.weather-card {
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
}
.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  color: #fff;
}
.hot {
  background-color: #ff7675;
}
.cool {
  background-color: #74b9ff;
}
.btn-detail {
  position: absolute;
  right: 12px;
  top: 15px;
  padding: 6px 10px;
  cursor: pointer;
}
</style>
