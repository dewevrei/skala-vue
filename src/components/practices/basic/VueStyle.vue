<script setup></script>

<template>
  <div class="practice-section">
    <section>
      <h2>Scoped 스타일 및 외부 CSS 활용</h2>
      <p class="title">이 글자는 이 컴포넌트 내부에서만 빨간색이 됩니다.</p>
      <button class="btn-external">외부 CSS에서 불러온 버튼 스타일</button>
    </section>

    <section>
      <h2>외부 CSS 활용</h2>
      <p class="title-external">이 글자는 외부 CSS 파일에서 불러온 스타일을 사용합니다.</p>
    </section>
  </div>
</template>

<style scoped>
.title {
  color: red;
  font-weight: bold;
}
</style>

<style>
@import '@/assets/challenge.css';
</style>
