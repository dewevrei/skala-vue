<script setup>
import { ref } from 'vue'
const message = ref('Hello Vue.js!')
const inputPlaceHolder = ref('값을 입력해주세요')
</script>

<template>
  <div class="practice-section">
    <h2>v-pre 디렉티브 학습</h2>
    <p>일반 출력: {{ message }}</p>
    <p v-pre>v-pre 출력: {{ message }}</p>
    <input v-pre :placeholder="inputPlaceHolder" />
  </div>
</template>
