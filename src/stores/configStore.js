import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  // 1. state: 단위를 저장하는 변수
  // 값은 오직 celsius 또는 fahrenheit 두 가지만 가집니다.
  // 초기 값은 celsius
  const unit = ref('celsius')

  // 2. getters: 현재 단위 상태에 맞춰 화면에 뿌릴 기호(℃ / ℉)를 실시간 리턴
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '°C' : '°F'
  })

  // 3. actions: 버튼 클릭 시 celsius와  fahrenheit를 토글하는 함수
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
  }
})
