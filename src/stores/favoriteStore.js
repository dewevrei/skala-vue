import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useFavoriteStore = defineStore('favorite', () => {
  // 1. state: 사용자가 즐겨찾기한 도시의 날씨 정보를 배열로 저장
  // 초기 값은 즐겨찾기한 도시가 없는 빈 배열
  const favorites = ref([])

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

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  }
})
