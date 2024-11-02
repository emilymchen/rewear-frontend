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

const fetchListedItems = async () => {
  try {
    const result = await fetchy("/api/donations/all", "GET");
    listedItems.value = result;
  } catch (error) {
    console.error("Error fetching listed items:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchListedItems);
</script>

<template>
  <section class="donation-page">
    <h1>Explore Items for Donation</h1>
    <div v-if="isLoading" class="loading-message">Loading items...</div>
    <div v-else-if="listedItems.length === 0" class="no-items-message">No items currently listed for donation.</div>
    <div v-else class="items-grid">
      <ItemCard v-for="item in listedItems" :key="item._id" :item="item" />
    </div>
  </section>
</template>

<style scoped>
.donation-page {
  padding: 2em;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #bbc3ac;
}
h1 {
  font-size: 2em;
  color: #333;
  margin-bottom: 1em;
  font-weight: bold;
  letter-spacing: 1px;
  width: 1200px;
}

.loading-message,
.no-items-message {
  font-size: 1.2em;
  color: #666;
  padding: 2em 0;
  width: 1200px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5em;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.5em;
  }

  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1em;
  }
}
</style>
