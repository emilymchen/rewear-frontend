<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";
import ItemCard from "./ItemCard.vue"; // Reusable card component

interface CatalogItem {
  _id: string;
  itemId: string;
  userId: string;
  photoUrl: string;
  name: string;
  type: string;
  color: string;
}

const listedItems = ref<CatalogItem[]>([]);
const isLoading = ref(true);

async function fetchListedItems() {
  try {
    const result = await fetchy("/api/donations/all", "GET");
    listedItems.value = result;
    console.log(result);
  } catch (error) {
    console.error("Error fetching listed items:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchListedItems);
</script>

<template>
  <section class="explore-page">
    <h1>Explore Items for Donation</h1>
    <div v-if="isLoading">Loading items...</div>
    <div v-else-if="listedItems.length === 0">No items currently listed for donation.</div>
    <div v-else class="items-grid">
      <ItemCard v-for="item in listedItems" :key="item._id" :item="item" />
    </div>
  </section>
</template>

<style scoped>
.explore-page {
  padding: 1em;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1em;
}
</style>
