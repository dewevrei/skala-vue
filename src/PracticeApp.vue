<script setup>
import SampleOne from './components/practices/basic/SampleOne.vue'
import SampleTwo from './components/practices/basic/SampleTwo.vue'

import VueBind from './components/practices/basic/VueBind.vue'
import VueBindClass from './components/practices/basic/VueBindClass.vue'
import VueBindStyle from './components/practices/basic/VueBindStyle.vue'
import VueBindShortHand from './components/practices/basic/VueBindShortHand.vue'
import VueHtml from './components/practices/basic/VueHtml.vue'
import VueHtmlXss from './components/practices/basic/VueHtmlXss.vue'
import VueText from './components/practices/basic/VueText.vue'
import VueIfElse from './components/practices/basic/VueIfElse.vue'
import VueShow from './components/practices/basic/VueShow.vue'
import VueFor from './components/practices/basic/VueFor.vue'
import VuePre from './components/practices/basic/VuePre.vue'
import VueCloak from './components/practices/basic/VueCloak.vue'
import VueOnce from './components/practices/basic/VueOnce.vue'
import VueMemo from './components/practices/basic/VueMemo.vue'
import VueOnEventHandler from './components/practices/basic/VueOnEventHandler.vue'
import EventObject from './components/practices/basic/EventObject.vue'
import EventModifier from './components/practices/basic/EventModifier.vue'
import VueModel from './components/practices/basic/VueModel.vue'
import VueModelFormBinding from './components/practices/basic/VueModelFormBinding.vue'
import VueModelModifier from './components/practices/basic/VueModelModifier.vue'
import VueStyle from './components/practices/basic/VueStyle.vue'
import ReactiveRef from './components/practices/composition/ReactiveRef.vue'
import ReactiveReactive from './components/practices/composition/ReactiveReactive.vue'
import ComputedBasic from './components/practices/composition/ComputedBasic.vue'
import WatchersBasic from './components/practices/composition/WatchersBasic.vue'
import WatchersMulti from './components/practices/composition/WatchersMulti.vue'
import WatchersDeep from './components/practices/composition/WatchersDeep.vue'
import WatchersReactive from './components/practices/composition/WatchersReactive.vue'
import WatchersReactiveArray from './components/practices/composition/WatchersReactiveArray.vue'
import WatchersRefArray from './components/practices/composition/WatchersRefArray.vue'
import WatchersWatchEffect from './components/practices/composition/WatchersWatchEffect.vue'
</script>

<template>
  <div style="padding: 20px">
    <SampleOne />
    <SampleTwo />
    <VueHtml />
    <VueHtmlXss />
    <VueText />
    <VueBind />
    <VueBindClass />
    <VueBindStyle />
    <VueBindShortHand />
    <VueIfElse />
    <VueShow />
    <VueFor />
    <VuePre />
    <VueCloak />
    <VueOnce />
    <VueMemo />
    <VueOnEventHandler />
    <EventObject />
    <EventModifier />
    <VueModel />
    <VueModelFormBinding />
    <VueModelModifier />
    <VueStyle />
    <ReactiveRef />
    <ReactiveReactive />
    <ComputedBasic />
    <WatchersBasic />
    <WatchersMulti />
    <WatchersDeep />
    <WatchersReactive />
    <WatchersReactiveArray />
    <WatchersRefArray />
    <WatchersWatchEffect />
  </div>
</template>

<style>
@import '@/assets/practice.css';
</style>
