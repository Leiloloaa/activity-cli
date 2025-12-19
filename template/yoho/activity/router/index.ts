import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const Home = () => import('../views/Home.vue')
const Rule = () => import('../views/Rule.vue')
const Rank = () => import('../views/Rank.vue')
const RankUser = () => import('../views/RankUser.vue')
const RankAnchor = () => import('../views/RankAnchor.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    children: [
      {
        path: 'rank',
        name: 'rank',
        component: Rank,
        children: [
          {
            path: 'user',
            name: 'user',
            component: RankUser
          },
          {
            path: 'anchor',
            name: 'anchor',
            component: RankAnchor
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

export default router
