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
const clothes = ref<ClothingArticle[]>([]); // Explicitly define the type

const emit = defineEmits(["close"]);
const handleClose = () => {
  emit("close");
};

async function getCatalogItems(author?: string) {
  let query: Record<string, string> = { category: props.type };
  if (author) {
    query.author = author;
  }

  let getResults;
  try {
    getResults = await fetchy("/api/catalog", "GET", { query });
    clothes.value = getResults;
    console.log(clothes.value);
  } catch (error) {
    console.error("Error fetching catalog items: ", error);
  }
}

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
  <div class="closetSectionContainer">
    <div class="closetTitle">{{ type }}</div>
    <div class="closetSection" @click="handleClose">X</div>
    <div class="closetContents">
      <NewCatalogItem :type="type" />
      <template v-if="hasClothes">
        <CatalogItem v-for="item in clothes" :key="item._id" :id="item._id" :photoUrl="item.photoUrl" :name="item.name" :color="item.color" :type="item.category" />
      </template>
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
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
  z-index: 8000; /* Lower than the modal */
}

/* Modal styling */
.closetSectionContainer {
  position: fixed;
  z-index: 9000; /* Higher than the overlay */
  width: calc(100vw - 20vh);
  height: 80vh;
  top: 10%;
  left: 10vh;
  background-repeat: no-repeat;
  background-position: center;
  background-color: var(--secondary);
  border-radius: 45px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* Shadow for depth */
}

/* Title styling */
.closetTitle {
  position: relative;
  z-index: 9100;
  top: calc(4vw - 0.75vh);
  left: 5vw;
  font-size: calc(2vw + 1.5vh);
}

/* Close button styling */
.closetSection {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 1.5vw;
  cursor: pointer;
  z-index: 9100;
}

/* Content styling */
.closetContents {
  position: relative;
  color: white;
  z-index: 9100;
  top: 20px;
  left: 5vw;
  width: calc(0.9 * (100vw - 20vh));
  height: 55vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-gap: 20px;
  padding: 10px;
}

/* Scrollbar styling */
.closetContents::-webkit-scrollbar-track {
  background-color: #ddbba5;
  border-radius: 10px;
}

.closetContents::-webkit-scrollbar-thumb {
  background-color: var(--tertiary);
  border-radius: 10px;
}

.closetContents::-webkit-scrollbar {
  width: 15px;
  height: 15px;
}
</style>
