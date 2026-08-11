<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const dummy = ref(0) // computed와 무관한 변수
const user = ref({ id: 0, name: '', email: '' })

// 1. 일반 함수: 화면이 조금이라도 리렌더링되면 무조건 재실행
const getMethodResult = () => {
  console.log('❌ 일반 함수 실행됨!')
  return count.value * 2
}

// 2. Computed: count가 바뀔 때만 재연산 (dummy가 바뀔 땐 이전 값 재사용)
const doubleCount = computed(() => {
  console.log('✅ Computed 연산 실행됨!')
  return count.value * 2
})

const userLists = ref([
  { id: 1, name: 'alice', email: 'alice@example.com' },
  { id: 2, name: 'bob', email: 'bob@example.com' },
])
const sortedUsersLists = computed(() => {
  console.log('sortedUsersLists ✅ Computed 연산 실행됨!')
  return [...userLists.value].sort((a, b) => {
    return a.name.localeCompare(b.name)
  })
})
const addUser = (user) => {
  userLists.value.push(user)
}
</script>

<template>
  <div class="practice-section">
    <h2>computed() 캐싱 동작 비교</h2>

    <p>count: {{ count }} | dummy: {{ dummy }}</p>
    <button @click="count++">count 증가 (의존성 변경)</button>
    <button @click="dummy++">dummy 증가 (무관한 변경)</button>

    <!-- dummy 버튼을 누를 때 콘솔 출력 차이를 확인 -->
    <p>일반 함수 결과: {{ getMethodResult() }}</p>
    <p>Computed 결과: {{ doubleCount }}</p>

    <p v-for="user in sortedUsersLists" :key="user.id">
      이름: {{ user.name }} 이메일: {{ user.email }}
    </p>
    <input type="number" v-model="user.id" />
    <input type="text" v-model.lazy="user.name" placeholder="이름을 입력하세요" />
    <input type="text" v-model.lazy="user.email" placeholder="이메일을 입력하세요" />
    <button @click="addUser(user)">사용자 추가</button>
  </div>
</template>
