<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

async function logout() {
  await logoutUser();
  void router.replace(`/`);
}

async function delete_() {
  await deleteUser();
  void router.replace(`/`);
}
</script>

<template>
  <main class="settings-page">
    <h1>Settings for {{ currentUsername }}</h1>
    <button class="pure-button logout-button" @click="logout">Logout</button>
    <button class="button-error pure-button" @click="delete_">Delete User</button>
    <UpdateUserForm />
  </main>
</template>

<style scoped>
.settings-page {
  padding: 2em;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  font-family: Arial, sans-serif;
  color: #333;
  background-color: var(--color-ash-gray); /* Background color from your color scheme */
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2em;
  color: var(--text-color); /* Accent color for header */
  margin-bottom: 1.5em;
}

.action-buttons {
  display: flex;
  gap: 1em;
  justify-content: center;
  margin-bottom: 2em;
}

.logout-button,
.delete-button {
  padding: 0.7em 1.2em;
  font-size: 1em;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
}

.logout-button {
  background-color: var(--color-moss-green);
  color: var(--text-color);
}

.logout-button:hover {
  background-color: #abcb90;
}

.delete-button {
  background-color: var(--color-tan);
  color: white;
}

.delete-button:hover {
  background-color: #d8a075;
}
</style>
