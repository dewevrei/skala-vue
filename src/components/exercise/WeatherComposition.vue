<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const searchQuery = ref('')
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')
const selectedWeatherId = ref('')

const bindQuery = (event) => {
  searchQuery.value = event.target.value
}
const showDetail = (cityName, status) => {
  alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
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
    <section class="search-box">
      <label for="city-input" style="display: block">🔍 도시 검색</label>
      <input
        id="city-input"
        type="text"
        placeholder="검색할 도시 이름을 입력하세요"
        :value="searchQuery"
        @input="bindQuery"
      />
      <p>검색 중인 도시: {{ searchQuery }}</p>
    </section>

    <section class="list-box">
      <p>지역별 날씨 현황</p>
      <div
        class="weather-card"
        v-for="weather in filteredWeatherList"
        :key="weather.id"
        @click="selectedWeatherId = weather.id"
      >
        <p>{{ weather.name }} ({{ weather.status }})</p>
        <p>현재 기온: {{ weather.temp }}°C</p>
        <span class="badge hot" v-if="weather.temp >= 25">🔥 더움 (25도 이상)</span>
        <span class="badge cool" v-else>❄️ 선선함 (25도 미만)</span>
        <button class="btn-detail" @click.stop="showDetail(weather.name, weather.status)">
          상세보기
        </button>
      </div>
      <p style="color: red" v-if="filteredWeatherList.length === 0">
        검색 결과와 일치하는 도시가 없습니다.
      </p>
    </section>

    <section class="status-bar">
      {{ statusMessage }}
    </section>
  </main>
</template>

<style scoped></style>
