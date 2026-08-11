<script setup>
import PracticeApp from './PracticeApp.vue'
import ExerciseApp from './ExerciseApp.vue'

// 이 한 줄만 바꾸면 화면이 전환
// 'practice' = 강의 예제
// 'exercise' = 과제
const MODE = 'exercise'
</script>

<template>
  <PracticeApp v-if="MODE === 'practice'" />
  <ExerciseApp v-else />
</template>
