// 将常用的组件注册为全局的组件
import Outline from './Outline.vue'
import Space from './Space.vue'
import SuperposeAvatar from './SuperposeAvatar.vue'
import Avatar from './Avatar.vue'

export default (Vue) => {
  Vue.component('Outline', Outline)
  Vue.component('Space', Space)
  Vue.component('SuperposeAvatar', SuperposeAvatar)
  Vue.component('Avatar', Avatar)
  Vue.component('JumpAvatar', Avatar)
}
