<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

const router = useRouter()
const route = useRoute()

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const searchQuery = ref('')
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')
const selectedWeatherId = ref('')

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((weather) => weather.name.includes(query))
})
const selectedWeather = computed(() =>
  weatherList.value.find((weather) => weather.id === selectedWeatherId.value),
)

watch(selectedWeather, (weather) => {
  if (weather) {
    statusMessage.value = `${weather.name}이 선택되었습니다.`
  }
})
watch(statusMessage, (newValue) => {
  console.log(`🤖 [watch 감지] 상태 바 문구가 업데이트되었습니다 -> ${newValue}이 선택되었습니다.`)
})
watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 ${searchQuery.value}에 매칭되는 API 데이터를 필터링했습니다.`,
  )
})

// 초기 마운트 시 주소창의 쿼리(?search=) 스트링 읽어서 상태 복원
onMounted(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
})

watch(searchQuery, (newQuery) => {
  const normalizedQuery = newQuery.trim()

  router.push({
    path: route.path,
    query: { search: normalizedQuery || undefined },
  })
})

const handleDetailJump = (cityId) => {
  router.push(`/weather/${cityId}`)
}
</script>

<template>
  <main class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
    </BaseDashboardCard>
    <BaseDashboardCard>
      <p>지역별 날씨 현황</p>
      <WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :city-item="item"
        @select-card="(id) => (selectedWeatherId = id)"
        @click-detail="handleDetailJump(item.id)"
      />
      <p
        v-if="filteredWeatherList.length === 0"
        style="text-align: center; color: #e74c3c; padding: 10px 0"
      >
        검색 결과와 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>
    <div class="status-bar">{{ statusMessage }}</div>
  </main>
</template>

<style scoped>
.status-bar {
  background: #e8f5e9;
  padding: 10px;
  text-align: center;
  color: #2e7d32;
  font-weight: bold;
  border-radius: 6px;
}
</style>
