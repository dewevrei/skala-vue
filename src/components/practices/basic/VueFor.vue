<script setup>
import { ref } from 'vue'

const fruits = ref(['사과', '바나나', '오렌지'])
const user = ref({ name: '홍길동', age: 30, address: { city: '울산', zipcode: '123456' } })
const items = ref([
  { id: 'prod_101', name: '아이폰' },
  { id: 'prod_102', name: '갤럭시' },
])
</script>

<template>
  <div class="practice-section">
    <h2>v-for 디렉티브 학습</h2>
    <h3>1) 배열 렌더링</h3>
    <ul>
      <li v-for="(fruit, index) in fruits" :key="index">{{ index + 1 }}번 과일: {{ fruit }}</li>
    </ul>
    <h3>2) 객체 렌더링</h3>
    <ul>
      <li v-for="(value, key, index) in user" :key="key">
        [{{ index }}] {{ key }} :
        <template v-if="typeof value === 'object'">
          <ul>
            <li v-for="(innerValue, innerKey) in value" :key="innerKey">
              {{ innerKey }} : {{ innerValue }}
            </li>
          </ul>
        </template>

        <template v-else>
          {{ value }}
        </template>
      </li>
    </ul>
    <h3>3) 배열 내 객체 렌더링</h3>
    <ul>
      <li v-for="(item, index) in items" :key="item.id">[{{ index }}] {{ item.name }}</li>
    </ul>
  </div>
</template>
