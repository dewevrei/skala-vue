<script setup>
const id = 'user-profile-card'
const src = 'https://vuejs.org/images/logo.png'
const alt = 'Vue 로고'
const width = '50px'
</script>

<template>
  <div class="practice-section">
    <h2>v-bind 디렉티브 고급 (단축 문법)</h2>
    <div :id>
      <img :src :alt :style="width" />
    </div>
  </div>
</template>
