<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { ElMessageBox } from 'element-plus'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherList from './WeatherList.vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', icon: '01d' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', icon: '10d' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', icon: '03d' },
])

const searchQuery = ref('')
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')
const selectedWeatherId = ref('')

const showDetail = (cityName, status) => {
  ElMessageBox.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`, '날씨 상세', {
    confirmButtonText: '확인',
    type: 'info',
  })
}
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
</script>

<template>
  <main class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
    </BaseDashboardCard>
    <BaseDashboardCard>
      <WeatherList
        :items="filteredWeatherList"
        @select-card="(id) => (selectedWeatherId = id)"
        @click-detail="showDetail"
      />
    </BaseDashboardCard>
    <el-alert :title="statusMessage" type="success" show-icon :closable="false" />
  </main>
</template>
