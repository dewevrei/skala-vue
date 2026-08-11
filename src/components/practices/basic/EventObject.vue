<script setup>
import { ref } from 'vue'

const position = ref('')
const tagName = ref('')
const timeStamp = ref('')

const getOnlyEvent = (e) => {
  position.value = `좌표: X=${e.clientX}, Y=${e.clientY}`
}
const getWithParam = (name, e) => {
  tagName.value = `대상: ${name} / 클릭된 태그: ${e.target.tagName}`
}
const getTimeStamp = (e) => {
  timeStamp.value = `${e.timeStamp}`
}
</script>

<template>
  <div class="practice-section">
    <h2>v-on 이벤트 객체($event) 활용</h2>
    <p>좌표: {{ position }}</p>
    <p>태그: {{ tagName }}</p>
    <p>페이지가 로드된 시점 부터 이벤트 발생 시간: {{ timeStamp }}</p>
    <button @click="getOnlyEvent">클릭 좌표 알아내기</button>
    <button @click="getWithParam('회원A', $event)">회원 정보와 태그 확인</button>
    <button @click="getTimeStamp">이벤트 발생 시간 확인</button>
  </div>
</template>
