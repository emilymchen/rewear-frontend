<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { computed, onBeforeMount, ref } from "vue";
import CatalogItem from "./CatalogItem.vue";
import NewCatalogItem from "./NewCatalogItem.vue";

interface ClothingArticle {
  _id: string;
  photoUrl: string;
  name: string;
  color: string;
  category: string;
  max_wears: number;
}

// Props
const props = defineProps<{
  type: string;
}>();

const loaded = ref(false);

// Reactive state
const clothes = ref<ClothingArticle[]>([]);

const emit = defineEmits(["close"]);
const handleClose = () => {
  emit("close");
};

const getCatalogItems = async (author?: string) => {
  let query: Record<string, string> = { category: props.type };
  if (author) {
    query.author = author;
  }

  let getResults;
  try {
    getResults = await fetchy("/api/catalog", "GET", { query });
    clothes.value = getResults;
  } catch (error) {
    console.error("Error fetching catalog items: ", error);
  }
};

const hasClothes = computed(() => clothes.value.length > 0);

onBeforeMount(async () => {
  await getCatalogItems();
  loaded.value = true;
});
</script>

<template>
  <!-- Overlay for background dimming -->
  <div class="overlay" @click="handleClose"></div>

  <!-- Modal container -->
  <div class="closet-section-container">
    <div class="closet-header">
      <h2 class="closet-title">{{ type }}</h2>
      <button class="close-button" @click="handleClose">✕</button>
    </div>
    <div class="closet-contents">
      <NewCatalogItem :type="type" />
      <template v-if="hasClothes">
        <CatalogItem v-for="item in clothes" :key="item._id" :id="item._id" :photoUrl="item.photoUrl" :name="item.name" :type="item.category" />
      </template>
      <p v-else class="no-items">No items found in this category.</p>
    </div>
  </div>
</template>

<style scoped>
/* Overlay styling for darkened background */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 8000;
}

/* Modal styling */
.closet-section-container {
  position: fixed;
  z-index: 9000;
  width: 90vw;
  max-width: 800px;
  height: 80vh;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f9f9f9;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header styling with title and close button */
.closet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.closet-title {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5em;
  color: #888;
  cursor: pointer;
  transition: color 0.3s;
}

.close-button:hover {
  color: #555;
}

/* Content styling for items grid */
.closet-contents {
  flex: 1;
  overflow-y: auto;
  padding-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

/* Individual item cards */
.no-items {
  text-align: center;
  font-size: 1.2em;
  color: #777;
  padding: 20px;
}

/* Scrollbar styling */
.closet-contents::-webkit-scrollbar {
  width: 8px;
}

.closet-contents::-webkit-scrollbar-track {
  background-color: #e6e6e6;
  border-radius: 10px;
}

.closet-contents::-webkit-scrollbar-thumb {
  background-color: #bbb;
  border-radius: 10px;
}
</style>
