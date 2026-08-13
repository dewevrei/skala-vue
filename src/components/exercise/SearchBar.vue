<script setup>
defineEmits(['update-query', 'submit-search'])

defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="search-area">
    <label for="city-input" class="search-label">🔍 도시 검색</label>
    <el-input
      id="city-input"
      class="search-input"
      size="large"
      clearable
      placeholder="검색할 도시 이름을 입력하세요"
      :model-value="currentQuery"
      @update:model-value="$emit('update-query', $event)"
      @keyup.enter="$emit('submit-search')"
    />
    <p class="search-caption">검색 중인 도시: {{ currentQuery || '없음' }}</p>
  </section>
</template>

<style scoped>
.search-area {
  display: grid;
  gap: 10px;
}

.search-label {
  color: #303133;
  font-size: 15px;
  font-weight: 700;
}

.search-input {
  width: 100%;
}

.search-caption {
  margin: 0;
  color: #909399;
  font-size: 13px;
}
</style>
