<script setup lang="ts">
import { fetchy } from "@/utils/fetchy"; // Adjust this if necessary
import { onMounted, ref } from "vue";
import ItemCard from "./ItemCard.vue";

// Define the type of the item structure
interface DonationItem {
  _id: string;
  itemId: string;
  name: string;
  photoUrl: string;
}

const isViewingListed = ref(true);
const listedItems = ref<DonationItem[]>([]);
const donatedItems = ref<DonationItem[]>([]);

// Fetch items listed for donation and previously donated items
const fetchDonationItems = async () => {
  try {
    listedItems.value = await fetchy("/api/donations", "GET");
    donatedItems.value = await fetchy("/api/donated", "GET");
  } catch (error) {
    console.error("Error fetching donation items:", error);
  }
};

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
      <!-- Close Button -->
      <button @click="emit('close')" class="close-button">X</button>

      <!-- Title -->
      <h2>Donation Box</h2>

      <!-- Toggle between Listed for Donation and Previously Donated -->
      <div class="toggle-container">
        <button :class="{ active: isViewingListed }" @click="isViewingListed = true">Listed for Donation</button>
        <button :class="{ active: !isViewingListed }" @click="isViewingListed = false">Previously Donated</button>
      </div>

      <!-- Display Items -->
      <div class="item-grid">
        <ItemCard v-if="isViewingListed" v-for="item in listedItems" :key="'listed-' + item._id" :item="item" />
        <ItemCard v-else v-for="item in donatedItems" :key="'donated-' + item._id" :item="item" />
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
  position: relative;
  background: var(--color-ash-gray);
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
}

/* Close Button */
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  color: var(--color-moss-green);
  transition: color 0.3s ease;
}

.close-button:hover {
  color: var(--color-tan);
}

/* Toggle Container */
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
  color: var(--color-moss-green);
}

.toggle-container button.active {
  color: black;
  border-bottom: 2px solid var(--color-tan);
}

/* Item Grid */
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1em;
}

/* Item Card Styling */
.item-card {
  background-color: var(--color-sage);
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
