<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineProps, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  item: {
    _id: string;
    itemId: string;
    photoUrl: string;
    name: string;
    color: string;
    type: string;
  };
}>();

const router = useRouter();

interface CatalogItem {
  _id: string;
  userId: string;
  category: string;
  photoUrl: string;
  name: string;
  type: string;
  color: string;
  max_wears: number | null;
  current_wears: number;
  min_temp: number | null;
  max_temp: number | null;
  times_rejected: number;
}

const catalogItem = ref<CatalogItem | null>(null); // Updated to hold a single CatalogItem or null

// Fetch catalog item details
async function getCatalogItem(id: string) {
  try {
    const getResults = await fetchy("/api/catalog/" + id, "GET");
    catalogItem.value = getResults;
    console.log(catalogItem.value);
  } catch (error) {
    console.error("Error fetching catalog item: ", error);
  }
}

function viewItem() {
  console.log("???", catalogItem.value?.category);
  router.push(`/view/${catalogItem.value?.category}/${catalogItem.value?._id}`);
}

onBeforeMount(() => {
  console.log("item", props.item.itemId);
  getCatalogItem(props.item.itemId);
});
</script>

<template>
  <div class="item-card" @click="viewItem">
    <img :src="catalogItem?.photoUrl" alt="Item Image" class="item-image" />
    <h2>{{ catalogItem?.name }}</h2>
    <!-- <p>{{ catalogItem?.color }} | {{ catalogItem?.type }}</p> -->
  </div>
</template>

<style scoped>
.item-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1em;
  text-align: center;
  cursor: pointer;
}

.item-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.item-card:hover {
  border-color: #007bff;
}
</style>
