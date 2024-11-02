<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from "vue";

interface ClothingArticle {
  _id: string;
  photoUrl: string;
  name: string;
  color: string;
  category: string;
  max_wears: number;
}

const props = defineProps<{
  catalogItems: ClothingArticle[];
  selectedItems: string[];
  showModal: boolean;
}>();

const emit = defineEmits(["update:selectedItems", "closeModal"]);

const localSelectedItems = ref<string[]>([...props.selectedItems]); // Track selections locally

// Filtered categories based on catalog items
const categories = computed(() => {
  const uniqueCategories = new Set(props.catalogItems.map((item) => item.category));
  return Array.from(uniqueCategories);
});

const activeCategory = ref<string | null>(null); // Track selected category

// Filter items based on the active category
const filteredItems = computed(() => (activeCategory.value ? props.catalogItems.filter((item) => item.category === activeCategory.value) : props.catalogItems));

const toggleSelection = (itemId: string) => {
  if (localSelectedItems.value.includes(itemId)) {
    localSelectedItems.value = localSelectedItems.value.filter((id) => id !== itemId);
  } else {
    localSelectedItems.value.push(itemId);
  }
};

const confirmSelection = () => {
  emit("update:selectedItems", localSelectedItems.value);
  closeModal();
};

const closeModal = () => {
  emit("closeModal");
};
</script>

<template>
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2>Select Clothing Items</h2>

      <!-- Category Tabs -->
      <div class="tabs">
        <button v-for="category in categories" :key="category" :class="{ active: activeCategory === category }" @click="activeCategory = category">
          {{ category }}
        </button>
        <button :class="{ active: !activeCategory }" @click="activeCategory = null">All</button>
      </div>

      <!-- Items Grid -->
      <div class="items-grid">
        <div v-for="item in filteredItems" :key="item._id" class="item-card" :class="{ selected: localSelectedItems.includes(item._id) }" @click="toggleSelection(item._id)">
          <img :src="item.photoUrl" :alt="item.name" />
          <p>{{ item.name }}</p>
          <input type="checkbox" :checked="localSelectedItems.includes(item._id)" />
        </div>
      </div>

      <!-- Modal Controls -->
      <button @click="confirmSelection">Confirm Selection</button>
      <button @click="closeModal">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 1em;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
}

.tabs {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
}

.tabs button {
  padding: 0.5em 1em;
  border: none;
  background-color: #ddd;
  cursor: pointer;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1em;
  margin-top: 1em;
}

.item-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5em;
  text-align: center;
  cursor: pointer;
  position: relative;
}

.item-card.selected {
  border-color: #007bff;
}

.item-card img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.item-card input[type="checkbox"] {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
