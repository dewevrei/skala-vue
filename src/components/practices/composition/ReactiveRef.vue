<script setup>
import { ref } from 'vue'

const count = ref(0)
const name = ref('홍길동')
const isActive = ref(true)
const fruit = ref('')
const items = ref(['사과', '배'])
const user = ref({
  name: '이순신',
  age: 30,
})

const increaseRef = () => {
  count.value++
}
const addFruit = (name) => {
  items.value.push(name)
}
const changeUserName = (name) => {
  user.value.name = name
}
</script>

<template>
  <div class="practice-section">
    <h2>반응형 상태 ref() 기초</h2>
    <p>
      Ref 카운트: <strong>{{ count }}</strong>
    </p>
    <p>이름: <input v-model="name" />{{ name }}</p>
    <p>활성 상태: {{ isActive ? '활성' : '비활성' }}</p>
    <p>과일 목록: {{ items.join(', ') }}</p>
    <p>사용자 정보: 이름 - {{ user.name }}, 나이 - {{ user.age }}</p>
    <button @click="increaseRef">Ref 변수 증가</button>
    <button @click="isActive = !isActive">토글</button>
    <input type="text" v-model="fruit" placeholder="과일 이름을 입력하세요" />
    <button @click="addFruit(fruit)">과일 추가</button>
    <input type="text" v-model="name" placeholder="이름을 입력하세요" />
    <button @click="changeUserName(name)">사용자 이름 변경</button>
  </div>
</template>
