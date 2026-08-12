<script setup>
defineEmits(['update-query'])

defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section>
    <label for="city-input" style="display: block">🔍 도시 검색</label>
    <input
      id="city-input"
      type="text"
      placeholder="검색할 도시 이름을 입력하세요"
      :value="currentQuery"
      @input="$emit('update-query', $event.target.value)"
    />
    <p>검색 중인 도시: {{ currentQuery }}</p>
  </section>
</template>

<style scoped>
.search-box {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e9ecef;
}
</style>
