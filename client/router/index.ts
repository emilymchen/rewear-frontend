import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import CatalogItemView from "../views/CatalogItemView.vue";
import ClosetView from "../views/ClosetView.vue";
import ExploreView from "../views/ExploreView.vue";
import InboxView from "../views/InboxView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import OotdView from "../views/OotdView.vue";
import SettingView from "../views/SettingView.vue";
import UploadCatalogItemView from "../views/UploadCatalogItemView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // {
    //   path: "/",
    //   name: "Home",
    //   component: HomeView,
    // },
    {
      path: "/setting",
      name: "settings",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/closet",
      name: "my closet",
      component: ClosetView,
      meta: { requiresAuth: true },
    },
    {
      path: "/",
      name: "explore",
      component: ExploreView,
      meta: { requiresAuth: true },
    },
    {
      path: "/inbox",
      name: "inbox",
      component: InboxView,
      meta: { requiresAuth: true },
    },
    {
      path: "/inbox/:id",
      name: "conversation",
      component: InboxView,
      meta: { requiresAuth: true },
    },
    {
      path: "/new/:category",
      name: "new",
      component: UploadCatalogItemView,
      meta: { requiresAuth: true },
    },
    {
      path: "/view/:category/:id",
      name: "view",
      component: CatalogItemView,
      meta: { requiresAuth: true },
    },
    {
      path: "/ootd/:id",
      name: "ootd",
      component: OotdView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "settings" };
        }
      },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
