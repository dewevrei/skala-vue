import axios from 'axios'
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'skala-weather-favorites'
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const cityQueryById = {
  city_01: 'Seoul',
  city_02: 'Suwon',
  city_03: 'Busan',
}

const loadStoredFavorites = () => {
  try {
    const storedFavorites = localStorage.getItem(STORAGE_KEY)
    if (!storedFavorites) return []

    const parsedFavorites = JSON.parse(storedFavorites)
    if (!Array.isArray(parsedFavorites)) return []

    return parsedFavorites.filter(
      (item) =>
        item &&
        (typeof item.id === 'string' || typeof item.id === 'number') &&
        typeof item.name === 'string' &&
        Number.isFinite(Number(item.temp)),
    )
  } catch (error) {
    console.warn('저장된 즐겨찾기 정보를 불러오지 못했습니다:', error)
    return []
  }
}

export const useFavoriteStore = defineStore('favorite', () => {
  // 저장된 즐겨찾기를 복원하고, 화면 진입 시 최신 날씨로 갱신한다.
  const favorites = ref(loadStoredFavorites())
  const isRefreshing = ref(false)
  const refreshErrorMessage = ref('')
  let refreshPromise = null

  watch(
    favorites,
    (items) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.warn('즐겨찾기 정보를 저장하지 못했습니다:', error)
      }
    },
    { deep: true },
  )

  // 2. getters: 전달받은 도시 id가 즐겨찾기 배열에 존재하는지 확인
  function isFavorite(cityId) {
    return favorites.value.some((item) => item.id === cityId)
  }

  // 3. action: 즐겨찾기에 없는 도시는 추가하고, 이미 있는 도시는 제거
  function toggleFavorite(cityItem) {
    // 도시 id를 기준으로 중복 여부와 배열 위치를 확인
    const index = favorites.value.findIndex((item) => item.id === cityItem.id)

    // findIndex의 결과가 -1이면 아직 즐겨찾기하지 않은 도시이므로 추가
    if (index === -1) {
      favorites.value.push({ ...cityItem })
      return
    }

    // 이미 즐겨찾기한 도시라면 찾은 위치의 항목을 제거
    favorites.value.splice(index, 1)
  }

  // 저장된 좌표를 우선 사용하고, 좌표가 없는 기존 항목은 도시명으로 조회한다.
  function getWeatherRequestParams(cityItem, apiKey) {
    const lat = Number(cityItem.lat)
    const lon = Number(cityItem.lon)

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon, appid: apiKey, units: 'metric', lang: 'kr' }
    }

    return {
      q: cityQueryById[cityItem.id] || cityItem.name,
      appid: apiKey,
      units: 'metric',
      lang: 'kr',
    }
  }

  // 여러 즐겨찾기 화면이 동시에 마운트되어도 하나의 갱신 요청만 공유한다.
  async function refreshFavoriteWeather() {
    if (refreshPromise) return refreshPromise

    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
    if (favorites.value.length === 0) {
      refreshErrorMessage.value = ''
      return
    }

    if (!apiKey) {
      refreshErrorMessage.value = '날씨 API 키가 설정되지 않아 최신 정보를 불러올 수 없습니다.'
      return
    }

    isRefreshing.value = true
    refreshErrorMessage.value = ''
    const favoriteSnapshot = favorites.value.map((item) => ({ ...item }))

    refreshPromise = Promise.allSettled(
      favoriteSnapshot.map((item) =>
        axios.get(WEATHER_URL, {
          params: getWeatherRequestParams(item, apiKey),
        }),
      ),
    ).then((results) => {
      let failedCount = 0

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failedCount += 1
          console.error('즐겨찾기 날씨 API 요청 실패:', result.reason)
          return
        }

        const originalItem = favoriteSnapshot[index]
        const currentIndex = favorites.value.findIndex((item) => item.id === originalItem.id)

        // API 요청 도중 사용자가 즐겨찾기를 해제했다면 다시 추가하지 않는다.
        if (currentIndex === -1) return

        const raw = result.value.data
        favorites.value[currentIndex] = {
          ...favorites.value[currentIndex],
          temp: raw.main.temp,
          status: raw.weather[0].description,
          icon: raw.weather[0].icon,
          lat: raw.coord.lat,
          lon: raw.coord.lon,
          updatedAt: Date.now(),
        }
      })

      if (failedCount > 0) {
        refreshErrorMessage.value = `${failedCount}개 지역의 최신 날씨를 불러오지 못했습니다.`
      }
    })

    try {
      await refreshPromise
    } catch (error) {
      console.error('즐겨찾기 날씨 갱신 실패:', error)
      refreshErrorMessage.value = '즐겨찾기 날씨를 갱신하지 못했습니다.'
    } finally {
      refreshPromise = null
      isRefreshing.value = false
    }
  }

  return {
    favorites,
    isRefreshing,
    refreshErrorMessage,
    isFavorite,
    toggleFavorite,
    refreshFavoriteWeather,
  }
})
