<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { useFavoriteStore } from '@/stores/favoriteStore'

const router = useRouter()
const favoriteStore = useFavoriteStore()

onMounted(() => {
  favoriteStore.refreshFavoriteWeather()
})

const handleDetailJump = (cityId) => {
  router.push(`/weather/${cityId}`)
}
</script>

<template>
  <div>
    <h3>즐겨찾기</h3>
    <hr />

    <BaseDashboardCard
      v-loading="favoriteStore.isRefreshing"
      element-loading-text="즐겨찾기 날씨를 갱신하는 중입니다..."
    >
      <el-alert
        v-if="favoriteStore.refreshErrorMessage"
        class="refresh-alert"
        :title="favoriteStore.refreshErrorMessage"
        type="warning"
        show-icon
        :closable="false"
      />
      <el-empty
        v-if="favoriteStore.favorites.length === 0"
        :image-size="90"
        description="즐겨찾기된 항목이 없습니다."
      />
      <template v-else>
        <WeatherCard
          v-for="item in favoriteStore.favorites"
          :key="item.id"
          :city-item="item"
          @click-detail="handleDetailJump(item.id)"
        />
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.refresh-alert {
  margin-bottom: 16px;
}
</style>
