<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import { useConfigStore } from '@/stores/configStore'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

const isLoading = ref(false)
const searchedLocationName = ref('')
const cityData = ref(null)
const forecastData = ref(null)
const searchErrorMessage = ref('')
const weatherErrorMessage = ref('')
const forecastErrorMessage = ref('')
let requestId = 0

// UTC 타임스탬프에 도시 시간대 차이를 적용해 날짜의 key와 표시 문구를 만든다.
const getLocalDateParts = (timestamp, timezoneOffset = 0) => {
  const date = new Date((timestamp + timezoneOffset) * 1000)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getUTCDay()]

  return {
    key: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    label: `${month}/${day}(${weekday})`,
  }
}

// UTC 타임스탬프를 해당 도시의 현지 시각인 HH:mm 형식으로 변환한다.
const getLocalTimeLabel = (timestamp, timezoneOffset = 0) => {
  const date = new Date((timestamp + timezoneOffset) * 1000)
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`
}

// API의 섭씨 온도를 현재 단위 설정에 맞춰 섭씨 또는 화씨 정수로 변환한다.
const formatTemperature = (temp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }
  return Math.round(temp)
}

// 현재 날씨의 원본 온도를 단위 설정에 맞춰 화면 표시용 값으로 계산한다.
const displayTemp = computed(() => {
  if (!cityData.value) return 0
  return formatTemperature(cityData.value.temp)
})

// 3시간 단위 예보를 도시의 현지 날짜별로 묶고 현재 날씨를 오늘 예보에 합친다.
const forecastDays = computed(() => {
  if (!forecastData.value) return []

  const timezoneOffset = forecastData.value.city.timezone
  const grouped = {}

  forecastData.value.list.forEach((item) => {
    const localDate = getLocalDateParts(item.dt, timezoneOffset)

    if (!grouped[localDate.key]) {
      grouped[localDate.key] = {
        key: localDate.key,
        label: localDate.label,
        items: [],
      }
    }

    const localTime = new Date((item.dt + timezoneOffset) * 1000)
    grouped[localDate.key].items.push({
      time: `${String(localTime.getUTCHours()).padStart(2, '0')}:00`,
      temp: item.main.temp,
      status: item.weather[0].description,
      icon: item.weather[0].icon,
    })
  })

  if (cityData.value) {
    const today = grouped[cityData.value.dateKey] || {
      key: cityData.value.dateKey,
      label: cityData.value.dateLabel,
      items: [],
    }

    today.items.unshift({
      time: cityData.value.currentTime,
      temp: cityData.value.temp,
      status: cityData.value.status,
      icon: cityData.value.icon,
    })
    grouped[today.key] = today
  }

  return Object.values(grouped)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(0, 5)
})

// URL 쿼리 값을 하나의 문자열로 정리하고 앞뒤 공백을 제거한다.
const getKeyword = (queryKeyword) => {
  const value = Array.isArray(queryKeyword) ? queryKeyword[0] : queryKeyword
  return typeof value === 'string' ? value.trim() : ''
}

// 검색어를 좌표로 변환한 뒤 현재 날씨와 5일 예보를 조회해 화면 상태를 갱신한다.
const fetchSearchWeather = async (queryKeyword) => {
  const currentRequestId = ++requestId
  const keyword = getKeyword(queryKeyword)

  cityData.value = null
  forecastData.value = null
  searchedLocationName.value = ''
  searchErrorMessage.value = ''
  weatherErrorMessage.value = ''
  forecastErrorMessage.value = ''

  if (!keyword) {
    searchErrorMessage.value = '검색어가 없습니다. 지역명을 입력해 주세요.'
    isLoading.value = false
    return
  }

  isLoading.value = true

  try {
    // 먼저 검색 지역을 날씨 API에서 사용할 좌표로 변환한다.
    const geoResponse = await axios.get(GEO_URL, {
      params: { q: keyword, limit: 1, appid: API_KEY },
    })

    if (currentRequestId !== requestId) return

    const location = geoResponse.data[0]
    if (!location) {
      searchErrorMessage.value = '검색 결과가 없습니다. 다른 지역명으로 검색해 주세요.'
      return
    }

    const { lat, lon } = location
    // 한국어 도시명이 없으면 OpenWeather의 기본 도시명을 사용한다.
    searchedLocationName.value = location.local_names?.ko || location.name

    // 두 요청 중 하나가 실패해도 성공한 날씨 데이터는 화면에 표시한다.
    const [weatherResult, forecastResult] = await Promise.allSettled([
      axios.get(WEATHER_URL, {
        params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr' },
      }),
      axios.get(FORECAST_URL, {
        params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr' },
      }),
    ])

    if (currentRequestId !== requestId) return

    if (weatherResult.status === 'fulfilled') {
      const raw = weatherResult.value.data
      const localDate = getLocalDateParts(raw.dt, raw.timezone)

      cityData.value = {
        name: searchedLocationName.value,
        temp: raw.main.temp,
        status: raw.weather[0].description,
        icon: raw.weather[0].icon,
        humidity: `${raw.main.humidity}%`,
        wind: `${raw.wind.speed}m/s`,
        dateKey: localDate.key,
        dateLabel: localDate.label,
        currentTime: getLocalTimeLabel(raw.dt, raw.timezone),
      }
    } else {
      console.error('현재 날씨 API 요청 실패:', weatherResult.reason)
      weatherErrorMessage.value = '현재 날씨 정보를 불러오지 못했습니다.'
    }

    if (forecastResult.status === 'fulfilled') {
      forecastData.value = forecastResult.value.data
    } else {
      console.error('5일 예보 API 요청 실패:', forecastResult.reason)
      forecastErrorMessage.value = '5일 예보 정보를 불러오지 못했습니다.'
    }
  } catch (error) {
    if (currentRequestId !== requestId) return
    console.error('지역 검색 API 요청 실패:', error)
    searchErrorMessage.value = '지역을 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    if (currentRequestId === requestId) {
      isLoading.value = false
    }
  }
}

// 검색 화면 최초 진입 시(immediate: true)와 URL의 keyword가 변경될 때 날씨를 다시 조회한다.
watch(() => route.query.keyword, fetchSearchWeather, { immediate: true })
</script>

<template>
  <main class="search-container">
    <el-card
      v-loading="isLoading"
      class="page-card"
      shadow="never"
      element-loading-text="검색 지역 날씨를 불러오는 중입니다..."
    >
      <template #header>
        <div class="page-header">
          <div>
            <h3>검색 지역 상세 기상 정보</h3>
            <p v-if="searchedLocationName">{{ searchedLocationName }}</p>
          </div>
          <el-tag v-if="cityData" type="primary" effect="light" round>
            {{ cityData.status }}
          </el-tag>
        </div>
      </template>

      <template v-if="!isLoading">
        <el-empty
          v-if="searchErrorMessage.includes('검색 결과가 없습니다')"
          :image-size="90"
          :description="searchErrorMessage"
        />
        <el-alert
          v-else-if="searchErrorMessage"
          :title="searchErrorMessage"
          type="error"
          show-icon
          :closable="false"
        />

        <template v-else>
          <el-descriptions v-if="cityData" class="weather-descriptions" :column="2" border>
            <el-descriptions-item label="지역">{{ cityData.name }}</el-descriptions-item>
            <el-descriptions-item label="실시간 기온">
              <strong class="temperature">{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="기상 현황">{{ cityData.status }}</el-descriptions-item>
            <el-descriptions-item label="대기 습도">{{ cityData.humidity }}</el-descriptions-item>
            <el-descriptions-item label="현재 풍속">{{ cityData.wind }}</el-descriptions-item>
          </el-descriptions>
          <el-alert
            v-else-if="weatherErrorMessage"
            :title="weatherErrorMessage"
            type="error"
            show-icon
            :closable="false"
          />

          <section v-if="forecastDays.length" class="forecast-section">
            <h4>5일 예보</h4>
            <div v-for="day in forecastDays" :key="day.key" class="forecast-day">
              <el-tag type="info" effect="plain" class="forecast-date">{{ day.label }}</el-tag>
              <div class="forecast-items">
                <el-card
                  v-for="item in day.items"
                  :key="`${day.key}-${item.time}`"
                  class="forecast-item"
                  shadow="never"
                >
                  <span>{{ item.time }}</span>
                  <img
                    class="forecast-icon"
                    :src="`https://openweathermap.org/img/wn/${item.icon}@2x.png`"
                    :alt="item.status"
                    :title="item.status"
                  />
                  <strong>{{ formatTemperature(item.temp) }}{{ configStore.unitSymbol }}</strong>
                </el-card>
              </div>
            </div>
          </section>
          <el-alert
            v-else-if="forecastErrorMessage"
            :title="forecastErrorMessage"
            type="error"
            show-icon
            :closable="false"
            class="forecast-alert"
          />
        </template>
      </template>

      <div class="page-actions">
        <el-button type="primary" plain @click="router.push('/')">
          ← 메인 대시보드로 돌아가기
        </el-button>
      </div>
    </el-card>
  </main>
</template>

<style scoped>
.search-container {
  margin: 0 auto;
}

.page-card {
  min-height: 220px;
  border-radius: 12px;
  --el-card-padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-header h3,
.page-header p,
.forecast-section h4 {
  margin: 0;
}

.page-header p {
  margin-top: 6px;
  color: #909399;
  font-size: 13px;
}

.weather-descriptions {
  margin-bottom: 22px;
}

.temperature {
  color: var(--el-color-primary);
  font-size: 18px;
}

.forecast-section {
  margin-top: 22px;
}

.forecast-section h4 {
  margin-bottom: 12px;
}

.forecast-day {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.forecast-date {
  flex: 0 0 auto;
  margin-top: 8px;
}

.forecast-items {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.forecast-item {
  min-width: 100px;
  border-radius: 8px;
  font-size: 12px;
  --el-card-padding: 10px;
}

.forecast-item :deep(.el-card__body) {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 5px;
}

.forecast-icon {
  display: block;
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.forecast-item strong {
  color: var(--el-color-primary);
  font-size: 14px;
}

.forecast-alert {
  margin-top: 16px;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 520px) {
  .forecast-day {
    flex-direction: column;
  }

  .forecast-date {
    margin-top: 0;
  }
}
</style>
