<script setup lang="ts">
import { fetchy } from "@/utils/fetchy"; // Adjust this if necessary
import { onMounted, ref } from "vue";
import ItemCard from "./ItemCard.vue";

const isViewingListed = ref(true);
const listedItems = ref([]);
const donatedItems = ref([]);

// Fetch items listed for donation and previously donated items
async function fetchDonationItems() {
  try {
    listedItems.value = await fetchy("/api/donations", "GET");
    donatedItems.value = await fetchy("/api/donated", "GET");
    console.log(listedItems.value);
    console.log(donatedItems.value);
  } catch (error) {
    console.error("Error fetching donation items:", error);
  }
}

// Switch between viewing listed and previously donated items
const toggleView = () => {
  isViewingListed.value = !isViewingListed.value;
};

onMounted(fetchDonationItems);

const emit = defineEmits(["close"]);
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Donation Box</h2>
      <button @click="emit('close')" class="close-button">X</button>

      <!-- Toggle between Listed for Donation and Previously Donated -->
      <div class="toggle-container">
        <button :class="{ active: isViewingListed }" @click="isViewingListed = true">Listed for Donation</button>
        <button :class="{ active: !isViewingListed }" @click="isViewingListed = false">Previously Donated</button>
      </div>

      <!-- Display Items -->
      <div class="item-grid">
        <div class="items-grid">
          <ItemCard v-if="isViewingListed" v-for="item in listedItems" :key="'listed-' + item._id" :item="item" />
          <ItemCard v-else v-for="item in donatedItems" :key="'donated-' + item._id" :item="item" />
        </div>
      </div>
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.toggle-container {
  display: flex;
  justify-content: center;
  gap: 1em;
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

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1em;
}

.item-card {
  background-color: #f3f3f3;
  border-radius: 8px;
  padding: 1em;
  text-align: center;
}

.item-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
