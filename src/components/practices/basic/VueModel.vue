<script setup>
import { ref } from 'vue'
const text1 = ref('')
const text2 = ref('')
const date = ref('')
const bindingInputValue = (event) => {
  text2.value = event.target.value
}
</script>

<template>
  <div class="practice-section">
    <h2>v-model 양방향 데이터 바인딩</h2>
    <h3>1) v-model 축약 문법</h3>
    <input type="text" v-model="text1" placeholder="값을 입력하세요" />
    <p>
      현재 입력된 값: <strong>{{ text1 }}</strong>
    </p>
    <input type="date" v-model="date" />
    <p>
      현재 선택된 날짜: <strong>{{ date }}</strong>
    </p>
    <h3>2) v-model의 내부 작동 원리 (단방향 + 이벤트)</h3>
    <!-- :value -> v-bind @input -> v-on:input -->
    <input type="text" :value="text2" @input="bindingInputValue" placeholder="원리 파악용 입력창" />
    <p>
      현재 입력된 값: <strong>{{ text2 }}</strong>
    </p>
  </div>
</template>
