<script setup>
const handleLink = () => {
  alert('prevent 수식어 덕분에 네이버로 이동하지 않고 함수만 실행됩니다!')
}
const handleBox = () => {
  alert('부모 박스가 클릭되었습니다!')
}
const handleChild1 = () => {
  alert('1번 자식 클릭!')
}
const handleChild2 = () => {
  alert('2번 자식(나만 켜짐) 클릭!')
}
const validateUsername = (event) => {
  const inputValue = event.target.value
  if (inputValue.length < 6) {
    alert('아이디는 최소 6글자 이상 입력해야 합니다.')
    event.target.value = ''
  }
}
const validatePassword = (event) => {
  const inputValue = event.target.value
  if (inputValue.length < 8) {
    alert('비밀번호는 최소 8글자 이상 입력해야 합니다.')
    event.target.value = ''
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>v-on 이벤트 수식어 학습</h2>
    <h3>1) .prevent 수식어 (기본 동작 막기)</h3>
    <a href="https://www.naver.com" @click.prevent="handleLink">네이버로 이동</a>
    <br />
    <h3>2) .stop 수식어 (이벤트 버블링 막기)</h3>
    <div @click="handleBox" style="padding: 20px; background-color: #eee">
      <p>부모 영역 (클릭 시 alert 발동)</p>
      <button @click="handleChild1">버블링 발생 버튼</button>
      <button @click.stop="handleChild2">버블링 차단 버튼</button>
    </div>
    <h3>3) .tab 수식어</h3>
    <div>
      <input type="text" placeholder="아이디를 입력하세요" @keydown.tab="validateUsername" />
      <input type="password" placeholder="비밀번호를 입력하세요" @keydown.tab="validatePassword" />
    </div>
  </div>
</template>
