<script setup>
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { useFavoriteStore } from '@/stores/favoriteStore'

const router = useRouter()
const favoriteStore = useFavoriteStore()

const handleDetailJump = (cityId) => {
  router.push(`/weather/${cityId}`)
}
</script>

<template>
  <div>
    <h3>즐겨찾기</h3>
    <hr />

    <BaseDashboardCard>
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
