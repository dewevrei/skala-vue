<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const isLoading = ref(false)
const cityData = ref(null)
const forecastData = ref(null)
const weatherErrorMessage = ref('')
const forecastErrorMessage = ref('')
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

const cityMapping = {
  city_01: { english: 'Seoul', korean: '대한민국 서울특별시' },
  city_02: { english: 'Suwon', korean: '경기도 수원시 영통구' },
  city_03: { english: 'Busan', korean: '부산광역시 해운대구' },
}

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

    const time = new Date((item.dt + timezoneOffset) * 1000)
    grouped[localDate.key].items.push({
      time: `${String(time.getUTCHours()).padStart(2, '0')}:00`,
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

// 현재 날씨 API 응답을 상세 화면에서 사용할 도시 데이터 형태로 저장한다.
const setCityData = (raw, targetCity) => {
  const localDate = getLocalDateParts(raw.dt, raw.timezone)

  cityData.value = {
    name: targetCity.korean,
    temp: raw.main.temp,
    status: raw.weather[0].description,
    icon: raw.weather[0].icon,
    humidity: `${raw.main.humidity}%`,
    wind: `${raw.wind.speed}m/s`,
    dateKey: localDate.key,
    dateLabel: localDate.label,
    currentTime: getLocalTimeLabel(raw.dt, raw.timezone),
  }
}

// URL 좌표를 유효한 숫자로 변환하고, 사용할 수 없는 값이면 null을 반환한다.
const parseCoordinate = (value) => {
  const coordinate = Array.isArray(value) ? value[0] : value
  if (coordinate === undefined || coordinate === null || coordinate === '') return null

  const parsedCoordinate = Number(coordinate)
  return Number.isFinite(parsedCoordinate) ? parsedCoordinate : null
}

const weatherRequestParams = {
  appid: API_KEY,
  units: 'metric',
  lang: 'kr',
}

// 전달받은 좌표로 현재 날씨와 5일 예보를 동시에 조회해 각각 저장한다.
const fetchByCoordinates = async (lat, lon, targetCity) => {
  // Home에서 좌표를 받으면 현재 날씨와 예보를 동시에 조회한다.
  const [weatherResult, forecastResult] = await Promise.allSettled([
    axios.get(WEATHER_URL, {
      params: { lat, lon, ...weatherRequestParams },
    }),
    axios.get(FORECAST_URL, {
      params: { lat, lon, ...weatherRequestParams },
    }),
  ])

  if (weatherResult.status === 'fulfilled') {
    setCityData(weatherResult.value.data, targetCity)
    console.log('현재 날씨 API 요청 성공')
  } else {
    console.error('현재 날씨 API 요청 실패:', weatherResult.reason)
    weatherErrorMessage.value = '현재 날씨 정보를 불러오지 못했습니다.'
  }

  if (forecastResult.status === 'fulfilled') {
    forecastData.value = forecastResult.value.data
    console.log('예보 API 요청 성공')
  } else {
    console.error('예보 API 요청 실패:', forecastResult.reason)
    forecastErrorMessage.value = '예보 정보를 불러오지 못했습니다.'
  }
}

// 좌표가 없으면 도시명으로 현재 날씨를 먼저 조회한 뒤 응답 좌표로 예보를 조회한다.
const fetchWithoutCoordinates = async (targetCity) => {
  // 직접 URL로 접근하면 현재 날씨에서 좌표를 얻은 뒤 예보를 조회한다.
  try {
    const weatherResponse = await axios.get(WEATHER_URL, {
      params: { q: targetCity.english, ...weatherRequestParams },
    })
    console.log('[순차] 현재 날씨 API 요청 성공')
    const raw = weatherResponse.data
    setCityData(raw, targetCity)

    try {
      const forecastResponse = await axios.get(FORECAST_URL, {
        params: { lat: raw.coord.lat, lon: raw.coord.lon, ...weatherRequestParams },
      })
      console.log('[순차] 예보 API 요청 성공')
      forecastData.value = forecastResponse.data
    } catch (error) {
      console.error('[순차] 예보 API 요청 실패:', error)
      forecastErrorMessage.value = '예보 정보를 불러오지 못했습니다.'
    }
  } catch (error) {
    console.error('[순차] 현재 날씨 API 요청 실패:', error)
    weatherErrorMessage.value = '현재 날씨 정보를 불러오지 못했습니다.'
    forecastErrorMessage.value = '좌표를 확인할 수 없어 5일 예보를 조회하지 못했습니다.'
  }
}

// 상세 화면 진입 시 도시와 좌표를 확인하고 적절한 조회 방식으로 데이터를 불러온다.
onMounted(async () => {
  const id = route.params.cityId
  const targetCity = cityMapping[id]

  if (targetCity) {
    isLoading.value = true
    try {
      const lat = parseCoordinate(route.query.lat)
      const lon = parseCoordinate(route.query.lon)

      if (lat !== null && lon !== null) {
        await fetchByCoordinates(lat, lon, targetCity)
      } else {
        await fetchWithoutCoordinates(targetCity)
      }
    } finally {
      isLoading.value = false
    }
  }
})

// 현재 날씨의 원본 섭씨 온도를 단위 설정에 맞춰 화면 표시용 값으로 계산한다.
const displayTemp = computed(() => {
  if (!cityData.value) return 0 // 아직 못 불러왔을 때 대비
  const rawTemp = cityData.value.temp // 원본 섭씨 온도
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32) // 화씨 공식 적용
  }
  return rawTemp // celsius 상태일 땐 원본 반환
})
</script>

<template>
  <main class="detail-container">
    <el-card
      v-loading="isLoading"
      class="page-card"
      shadow="never"
      element-loading-text="상세 날씨 정보를 불러오는 중입니다..."
    >
      <template #header>
        <div class="page-header">
          <div>
            <h3>지역별 상세 기상 관측 정보</h3>
            <p v-if="cityData">{{ cityData.name }}</p>
          </div>
          <el-tag v-if="cityData" type="primary" effect="light" round>
            {{ cityData.status }}
          </el-tag>
        </div>
      </template>

      <template v-if="!isLoading">
        <el-descriptions v-if="cityData" class="weather-descriptions" :column="2" border>
          <el-descriptions-item label="지역">{{ cityData.name }}</el-descriptions-item>
          <el-descriptions-item label="실시간 기온">
            <strong class="temperature">{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
          </el-descriptions-item>
          <el-descriptions-item label="기상 현황">{{ cityData.status }}</el-descriptions-item>
          <el-descriptions-item label="대기 습도">{{ cityData.humidity }}</el-descriptions-item>
          <el-descriptions-item label="현재 풍속">{{ cityData.wind }}</el-descriptions-item>
        </el-descriptions>

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

        <div class="alerts">
          <el-alert
            v-if="weatherErrorMessage"
            :title="weatherErrorMessage"
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="forecastErrorMessage"
            :title="forecastErrorMessage"
            type="error"
            show-icon
            :closable="false"
          />
        </div>

        <el-empty
          v-if="!cityData && !weatherErrorMessage"
          :image-size="90"
          description="해당 지역의 상세 데이터가 없습니다."
        />
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
.detail-container {
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

.alerts {
  display: grid;
  gap: 8px;
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
