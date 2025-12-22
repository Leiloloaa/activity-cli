import { defineStore } from 'pinia'

const store = defineStore('main', {
  state: () => {
    return {
      getStage: 0, // 触发更新
      shoot: (item) => { }
    }
  },
  getters: {},
  actions: {}
})

export default store

// 用法
// import { storeToRefs } from 'pinia'
// import store from '../store'
// const mainStore = store()
// const {  } = storeToRefs(mainStore)

// // composition API 写法
// export const mainStore = defineStore('main', () => {
//   const helloWorld = ref('hello world!')
//   return { helloWorld }
// })
