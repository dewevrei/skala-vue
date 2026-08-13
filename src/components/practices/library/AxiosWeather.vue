<script setup>
import { ref } from 'vue'
import axios from 'axios'

const weatherData = ref(null)
const isLoading = ref(false)
const searchKeyword = ref('')
const searchedWeatherData = ref(null)
const isSearching = ref(false)
const searchErrorMessage = ref('')
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const handleFetchWeather = async () => {
  isLoading.value = true

  const URL = `https://api.openweathermap.org/data/2.5/weather?lat=35.158582&lon=126.804975&appid=${API_KEY}&units=metric&lang=kr`

  try {
    // 비동기 통신 가동: 서버에서 데이터를 다 가져올 때까지 await로 기다립니다.
    const response = await axios.get(URL)
    // fetch와 달리 .json() 변환 과정 없이 response.data에 알맹이가 즉시 담깁니다.
    console.log('Axios 통신 응답 전체 객체:', response)
    console.log('백엔드가 준 핵심 날씨 데이터(JSON):', response.data)
    weatherData.value = response.data
  } catch (error) {
    // 4xx, 5xx 에러나 네트워크 오프라인 시 자동으로 이 catch 영역으로 튕겨 들어옵니다.
    console.error('통신 중 에러가 발생했습니다:', error)
    alert('데이터를 가져오지 못했습니다. API 키 활성화 여부나 주소를 확인하세요.')
  } finally {
    isLoading.value = false
  }
}

const handleSearchWeather = async () => {
  const keyword = searchKeyword.value.trim()

  if (!keyword) {
    alert('검색어를 입력하세요.')
    return
  }

  if (isSearching.value) return

  isSearching.value = true
  searchErrorMessage.value = ''
  searchedWeatherData.value = null

  try {
    // OpenWeather 날씨 API 호출에 위도와 경도를 제공해야하므로
    // 지역명으로 검색하려면 지오코딩 API를 사용해 사용자가 검색한 지역명으로 위도와 경도를 받아와야한다.
    const geoResponse = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: keyword,
        limit: 1,
        appid: API_KEY,
      },
    })

    if (geoResponse.data.length === 0) {
      searchErrorMessage.value = '검색 결과가 없습니다. 다른 지역명으로 다시 검색하세요.'
      return
    }

    const { lat, lon } = geoResponse.data[0]

    console.log('지오코딩 API 응답:', geoResponse.data[0])

    // 지오코딩 API로 받아온 지역의 위도와 경도를 바탕으로 날씨 API 호출
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })

    console.log('날씨 API 응답:', weatherResponse.data)

    searchedWeatherData.value = weatherResponse.data
  } catch (error) {
    console.error('날씨 검색 중 에러가 발생했습니다:', error)
    searchErrorMessage.value = '날씨 데이터를 가져오지 못했습니다. API 키나 검색어를 확인하세요.'
  } finally {
    isSearching.value = false
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>⚡ Axios 통신 검증</h2>
    <button @click="handleFetchWeather" :disabled="isLoading">
      {{ isLoading ? '데이터 로딩 중...' : '실시간 날씨 데이터 당겨오기' }}
    </button>
    <div v-if="weatherData" class="result-card">
      <p>
        📍 위치: <strong>{{ weatherData.name }}</strong>
      </p>
      <p>
        🌡️ 현재 기온: <strong>{{ weatherData.main.temp }}°C</strong> (정상 섭씨 변환 완료)
      </p>
      <p>
        ☁️ 날씨 상태: <strong>{{ weatherData.weather[0].description }}</strong>
      </p>
      <p>
        💧 습도: <strong>{{ weatherData.main.humidity }}%</strong>
      </p>
    </div>
    <div v-else>
      <p>아직 가져온 데이터가 없습니다. 버튼을 눌러 통신을 가동하세요.</p>
    </div>
  </div>

  <!-- 날씨 데이터 검색 -->
  <div class="practice-section">
    <h2>⚡ 실시간 날씨 데이터 검색</h2>
    <div class="search-box">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="지역명을 입력하세요. 예시: 서울, 울산"
        :disabled="isSearching"
        @keyup.enter="handleSearchWeather"
      />
      <button @click="handleSearchWeather" :disabled="isSearching">
        {{ isSearching ? '검색 중...' : '검색' }}
      </button>
    </div>

    <p v-if="searchErrorMessage" class="error-message">
      {{ searchErrorMessage }}
    </p>

    <div v-if="searchedWeatherData" class="result-card">
      <p>
        📍 위치: <strong>{{ searchedWeatherData.name }}</strong>
      </p>
      <p>
        🌡️ 현재 기온: <strong>{{ searchedWeatherData.main.temp }}°C</strong>
      </p>
      <p>
        ☁️ 날씨 상태: <strong>{{ searchedWeatherData.weather[0].description }}</strong>
      </p>
      <p>
        💧 습도: <strong>{{ searchedWeatherData.main.humidity }}%</strong>
      </p>
    </div>
    <div v-else-if="!searchErrorMessage">
      <p>지역명을 입력하고 엔터를 누르거나 검색 버튼을 클릭하세요.</p>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  line-height: 1.8;
}
.result-card strong {
  color: #0284c7;
}
.search-box {
  display: flex;
  gap: 8px;
  align-items: center;
}
.search-box input {
  min-width: 280px;
}
.error-message {
  color: #dc2626;
}
</style>
