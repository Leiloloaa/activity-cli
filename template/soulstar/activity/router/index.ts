
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import home from '../template/home/home.vue';

const routerList: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home'
    },{
        path: '/home',
        name: 'home',
        component: home
    },{
        path: '/rule',
        name: 'rule',
        component: () => import('../template/rule/rule.vue')
    },
]

const router = createRouter({
    routes: routerList,
    history: createWebHashHistory()
});

export default router;

