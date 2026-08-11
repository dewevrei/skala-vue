<script setup>
import { ref } from 'vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])
const query = ref('')
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')
const bindQuery = (event) => {
  query.value = event.target.value
}
const handleStatusBar = (cityName) => {
  statusMessage.value = `${cityName}이 선택되었습니다.`
}
const showDetail = (cityName, status) => {
  alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <main class="dashboard-wrapper">
    <section class="search-box">
      <label for="city-input" style="display: block">🔍 도시 검색</label>
      <input
        id="city-input"
        type="text"
        placeholder="검색할 도시 이름을 입력하세요"
        :value="query"
        @input="bindQuery"
      />
      <p>검색 중인 도시: {{ query }}</p>
    </section>

    <section class="list-box">
      <p>지역별 날씨 현황</p>
      <div
        class="weather-card"
        v-for="weather in weatherList"
        :key="weather.id"
        @click="handleStatusBar(weather.name)"
      >
        <p>{{ weather.name }} ({{ weather.status }})</p>
        <p>현재 기온: {{ weather.temp }}°C</p>
        <span class="badge hot" v-if="weather.temp >= 25">🔥 더움 (25도 이상)</span>
        <span class="badge cool" v-else>❄️ 선선함 (25도 미만)</span>
        <button class="btn-detail" @click.stop="showDetail(weather.name, weather.status)">
          상세보기
        </button>
      </div>
    </section>

    <section class="status-bar">
      {{ statusMessage }}
    </section>
  </main>
</template>

<style scoped></style>
