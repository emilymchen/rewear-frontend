<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <div class="title">
        <img src="@/assets/images/logo.svg" />
        <RouterLink :to="{ name: 'Home' }">
          <h1>Rewear</h1>
        </RouterLink>
      </div>
      <ul>
        <li>
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <div className="nav-item">
            <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }"> Settings </RouterLink>
          </div>
          <div className="nav-item">
            <RouterLink :to="{ name: 'my closet' }" :class="{ underline: currentRouteName == 'my closet' }"> my closet </RouterLink>
          </div>
          <div className="nav-item">
            <RouterLink :to="{ name: 'explore' }" :class="{ underline: currentRouteName == 'explore' }"> explore </RouterLink>
          </div>
          <div className="nav-item">
            <RouterLink :to="{ name: 'inbox' }" :class="{ underline: currentRouteName == 'inbox' }"> inbox </RouterLink>
          </div>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";

nav {
  padding: 1em 0em;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
}

.nav-item {
  display: inline-block;
  padding-right: 1em;
}

h1 {
  font-size: 2em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: black;
  text-decoration: none;
}

ul {
  list-style-type: none;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.underline {
  text-decoration: underline;
}
</style>

<style>
:root {
  --color-ash-gray: #cfd5c4;
  --color-moss-green: #89985f;
  --color-tan: #d8b28c;
  --color-sage-1: #c2c996;
  --color-sage-2: #c4d1a1;

  /* Basic Theme Colors */
  --background-color: var(--color-ash-gray);
  --primary-color: var(--color-moss-green);
  --accent-color: var(--color-tan);
  --secondary-background: var(--color-sage-1);
  --highlight-color: var(--color-sage-2);

  /* Text Colors */
  --text-color: #333; /* Set a dark color for contrast */
  --text-light: #ffffff;
}
</style>
