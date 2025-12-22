import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

import Home from "../views/Home.vue";

const routerList: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: Home,
    redirect: "/home/anchor-rank",
    children: [
      {
        path: "anchor-rank",
        name: "anchor-rank",
        component: () => import("../views/AnchorRank.vue"),
      },
      {
        path: "user-rank",
        name: "user-rank",
        component: () => import("../views/UserRank.vue"),
      },
      {
        path: "guild-rank",
        name: "guild-rank",
        component: () => import("../views/GuildRank.vue"),
      },
      {
        path: "lottery",
        name: "lottery",
        component: () => import("../views/Lottery/index.vue"),
      },
    ],
  },
  {
    path: "/rule",
    name: "rule",
    component: () => import("../views/Rule.vue"),
  },
];

const router = createRouter({
  routes: routerList,
  history: createWebHashHistory(),
});

export default router;
