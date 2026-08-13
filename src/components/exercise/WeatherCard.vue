<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'

const props = defineProps({
  cityItem: { type: Object, required: true },
})

const emit = defineEmits(['select-card', 'click-detail'])

const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()
// 스토어의 상태값이 fahrenheit일 때만 화씨 공식 적용 연산
const displayTemp = computed(() => {
  const rawTemp = props.cityItem.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp // 'celsius'일 때는 원본 그대로 반환
})
</script>

<template>
  <el-card class="weather-card" shadow="hover" @click="emit('select-card', cityItem.id)">
    <div class="weather-content">
      <div class="weather-summary">
        <div>
          <h3 class="city-name">
            <svg
              v-if="cityItem.isCurrentLocation"
              class="current-location-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            {{ cityItem.name }}
          </h3>
          <p v-if="cityItem.isCurrentLocation && cityItem.locationName" class="location-name">
            {{ cityItem.locationName }}
          </p>
          <div class="weather-condition">
            <img
              v-if="cityItem.icon"
              class="weather-icon"
              :src="`https://openweathermap.org/img/wn/${cityItem.icon}@2x.png`"
              alt=""
              aria-hidden="true"
            />
            <p class="weather-status">({{ cityItem.status }})</p>
          </div>
        </div>
        <strong class="temperature">{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
      </div>

      <div class="weather-footer">
        <el-tag v-if="cityItem.temp >= 25" type="danger" effect="light" round>
          🔥 더움 (25도 이상)
        </el-tag>
        <el-tag v-else type="primary" effect="light" round>❄️ 선선함 (25도 미만)</el-tag>

        <div class="weather-actions">
          <el-button
            type="primary"
            size="small"
            @click.stop="emit('click-detail', cityItem.name, cityItem.status)"
          >
            상세보기
          </el-button>
          <el-button
            v-if="!cityItem.isCurrentLocation"
            type="warning"
            size="small"
            :plain="!favoriteStore.isFavorite(cityItem.id)"
            @click.stop="favoriteStore.toggleFavorite(cityItem)"
          >
            {{ favoriteStore.isFavorite(cityItem.id) ? '즐겨찾기 해제' : '즐겨찾기' }}
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.weather-card {
  margin-bottom: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
  --el-card-padding: 16px;
}

.weather-card:hover {
  border-color: var(--el-color-primary-light-5);
  transform: translateY(-2px);
}

.weather-content {
  display: grid;
  gap: 16px;
}

.weather-summary,
.weather-footer,
.weather-actions {
  display: flex;
  align-items: center;
}

.weather-summary,
.weather-footer {
  justify-content: space-between;
  gap: 12px;
}

.city-name,
.weather-status {
  margin: 0;
}

.city-name {
  display: flex;
  align-items: center;
  color: #303133;
  font-size: 18px;
}

.current-location-icon {
  width: 16px;
  height: 16px;
  margin-right: 5px;
  color: var(--el-color-primary);
  fill: currentColor;
}

.location-name {
  margin: 4px 0 0;
  color: #606266;
  font-size: 13px;
}

.weather-status {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.weather-condition {
  display: flex;
  align-items: center;
  min-height: 52px;
}

.weather-icon {
  display: block;
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.temperature {
  color: var(--el-color-primary);
  font-size: 24px;
}

.weather-actions {
  justify-content: flex-end;
}

@media (max-width: 520px) {
  .weather-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .weather-actions {
    align-self: stretch;
  }
}
</style>
