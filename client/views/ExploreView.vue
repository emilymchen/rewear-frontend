<script setup lang="ts">
import DonationListComponent from "@/components/Donation/DonationListComponent.vue";
import FavoriteListComponent from "@/components/Favorite/FavoriteListComponent.vue";
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

// Toggle state: 'posts' or 'donations'
const currentView = ref<"posts" | "donations">("posts");

// Toggle function to switch views
function toggleView(view: "posts" | "donations") {
  currentView.value = view;
}
</script>

<template>
  <main class="explore-page">
    <!-- Navigation Buttons -->
    <div class="toggle-container">
      <button :class="{ active: currentView === 'posts' }" @click="toggleView('posts')">discover today’s looks</button>
      <button :class="{ active: currentView === 'donations' }" @click="toggleView('donations')">browse donation items</button>
    </div>

    <!-- Search and Filter Options -->
    <div class="search-filter">
      <input type="text" placeholder="Search..." />
      <button><i class="icon-search"></i></button>
      <div class="filter-sort">
        <button><i class="icon-filter"></i> filter</button>
        <button><i class="icon-sort"></i> sort</button>
      </div>
    </div>

    <!-- Display the active component based on the toggle state -->
    <div class="content-container">
      <PostListComponent v-if="currentView === 'posts'" />
      <DonationListComponent v-else />
      <FavoriteListComponent />
    </div>
  </main>
</template>

<style scoped>
.explore-page {
  padding: 1em;
}

.toggle-container {
  display: flex;
  gap: 1em;
  justify-content: center;
  margin-bottom: 1em;
}

.toggle-container button {
  padding: 0.5em 1em;
  font-weight: bold;
  cursor: pointer;
  border: none;
  background: transparent;
}

.toggle-container button.active {
  color: black;
  border-bottom: 2px solid black;
}

.search-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1em;
  margin-bottom: 1em;
}

.search-filter input {
  padding: 0.5em;
  border-radius: 4px;
  border: 1px solid #ccc;
  flex: 1;
}

.search-filter button {
  background: none;
  border: none;
  cursor: pointer;
}

.filter-sort {
  display: flex;
  gap: 0.5em;
}

.content-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1em;
}
</style>
