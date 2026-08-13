<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

const router = useRouter()
const route = useRoute()

const weatherList = ref([])
const searchQuery = ref('')
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')
const selectedWeatherId = ref('')
const isLoading = ref(false)
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

// 주요 도시의 현재 날씨를 동시에 조회해 홈 화면의 날씨 목록을 만든다.
const fetchRealTimeWeather = async () => {
  isLoading.value = true
  try {
    const [seoulRes, suwonRes, busanRes] = await Promise.all([
      axios.get(`${BASE_URL}`, {
        params: {
          q: 'Seoul',
          appid: API_KEY,
          units: 'metric',
          lang: 'kr',
        },
      }),
      axios.get(`${BASE_URL}`, {
        params: {
          q: 'Suwon',
          appid: API_KEY,
          units: 'metric',
          lang: 'kr',
        },
      }),
      axios.get(`${BASE_URL}`, {
        params: {
          q: 'Busan',
          appid: API_KEY,
          units: 'metric',
          lang: 'kr',
        },
      }),
    ])

    weatherList.value = [
      {
        id: 'city_01',
        name: '서울',
        temp: seoulRes.data.main.temp,
        status: seoulRes.data.weather[0].description,
        icon: seoulRes.data.weather[0].icon,
        lat: seoulRes.data.coord.lat,
        lon: seoulRes.data.coord.lon,
      },
      {
        id: 'city_02',
        name: '수원',
        temp: suwonRes.data.main.temp,
        status: suwonRes.data.weather[0].description,
        icon: suwonRes.data.weather[0].icon,
        lat: suwonRes.data.coord.lat,
        lon: suwonRes.data.coord.lon,
      },
      {
        id: 'city_03',
        name: '부산',
        temp: busanRes.data.main.temp,
        status: busanRes.data.weather[0].description,
        icon: busanRes.data.weather[0].icon,
        lat: busanRes.data.coord.lat,
        lon: busanRes.data.coord.lon,
      },
    ]
    console.log('[API 통신 완료] 실시간 기상 장부 동기화:', weatherList.value)
  } catch (error) {
    console.error('날씨 API 연동 실패:', error)
  } finally {
    isLoading.value = false
  }
}

// 입력한 검색어가 포함된 도시만 보여 주며, 검색어가 없으면 전체 목록을 반환한다.
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((weather) => weather.name.includes(query))
})

// 선택된 카드의 id와 일치하는 도시 날씨 객체를 찾아 반환한다.
const selectedWeather = computed(() =>
  weatherList.value.find((weather) => weather.id === selectedWeatherId.value),
)

// 선택된 도시가 바뀌면 하단 상태 메시지를 해당 도시명으로 갱신한다.
watch(selectedWeather, (weather) => {
  if (weather) {
    statusMessage.value = `${weather.name}이 선택되었습니다.`
  }
})

// 상태 메시지가 바뀔 때 변경 내용을 콘솔에 기록한다.
watch(statusMessage, (newValue) => {
  console.log(`🤖 [watch 감지] 상태 바 문구가 업데이트되었습니다 -> ${newValue}이 선택되었습니다.`)
})

// 검색어 또는 필터 결과에 쓰이는 반응형 값의 변화를 감지해 검색 상태를 기록한다.
watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 ${searchQuery.value}에 매칭되는 API 데이터를 필터링했습니다.`,
  )
})

// 초기 마운트 시 URL의 검색어를 복원하고 주요 도시 날씨를 조회한다.
onMounted(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  fetchRealTimeWeather()
})

// 검색어가 바뀌면 새로고침 후에도 유지되도록 URL의 search 쿼리를 동기화한다.
watch(searchQuery, (newQuery) => {
  const normalizedQuery = newQuery.trim()

  router.push({
    path: route.path,
    query: { search: normalizedQuery || undefined },
  })
})

// Enter 검색 시 공백을 제거한 검색어를 쿼리에 담아 검색 결과 화면으로 이동한다.
const handleSearchSubmit = () => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return

  router.push({
    name: 'WeatherSearch',
    query: { keyword },
  })
}

// 선택한 도시의 id와 좌표를 전달하며 날씨 상세 화면으로 이동한다.
const handleDetailJump = (weather) => {
  router.push({
    name: 'WeatherDetail',
    params: { cityId: weather.id },
    query: {
      lat: weather.lat,
      lon: weather.lon,
    },
  })
}
</script>

<template>
  <main class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar
        :current-query="searchQuery"
        @update-query="(val) => (searchQuery = val)"
        @submit-search="handleSearchSubmit"
      />
    </BaseDashboardCard>
    <BaseDashboardCard
      v-loading="isLoading"
      element-loading-text="실시간 기상 데이터를 불러오는 중입니다..."
    >
      <h3 class="list-title">지역별 날씨 현황</h3>
      <template v-if="!isLoading">
        <el-empty
          v-if="filteredWeatherList.length === 0"
          :image-size="80"
          description="검색 결과와 일치하는 도시가 없습니다."
        />
        <template v-else>
          <WeatherCard
            v-for="item in filteredWeatherList"
            :key="item.id"
            :city-item="item"
            @select-card="(id) => (selectedWeatherId = id)"
            @click-detail="handleDetailJump(item)"
          />
        </template>
      </template>
    </BaseDashboardCard>
    <el-alert :title="statusMessage" type="success" show-icon :closable="false" />
  </main>
</template>

<style scoped>
.list-title {
  margin: 0 0 16px;
  color: #303133;
  font-size: 17px;
}
</style>
