<script setup>
import { ref } from 'vue'
const count = ref(0)

const showAlert = () => {
  alert('함수가 정상적으로 호출되었습니다!')
}

const redirectToGoogle = () => {
  location.href = 'https://www.google.com'
}
</script>

<template>
  <div class="practice-section">
    <h2>v-on 이벤트 핸들러 학습</h2>
    <h3>1) 인라인 연산 처리</h3>
    <p>현재 카운트: {{ count }}</p>
    <button @click="count++">1씩 증가 버튼</button>
    <br />
    <h3>2) 스크립트 함수 호출</h3>
    <button @click="showAlert">알림창 띄우기 버튼</button>
    <button @click="redirectToGoogle">구글로 이동</button>
  </div>
</template>
