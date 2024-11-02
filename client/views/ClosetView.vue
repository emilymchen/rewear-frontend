<script setup lang="ts">
import CatalogModal from "@/components/Catalog/CatalogModal.vue";
import DonationBoxModal from "@/components/Donation/DonationBoxModal.vue";
import CreateOutfitPostForm from "@/components/Post/CreateOutfitPostForm.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const catalogType = ref<string | null>(null);
const isCatalogModalOpen = ref(false);
const isDonationBoxModalOpen = ref(false);

const openCatalogModal = (type: string) => {
  catalogType.value = type;
  isCatalogModalOpen.value = true;
};

const closeCatalogModal = () => {
  catalogType.value = null;
  isCatalogModalOpen.value = false;
};

const openDonationBoxModal = () => {
  isDonationBoxModalOpen.value = true;
};

const closeDonationBoxModal = () => {
  isDonationBoxModalOpen.value = false;
};
</script>

<template>
  <main class="closet-container">
    <h1 class="closet-title">My Closet</h1>
    <div class="category-buttons">
      <button @click="openCatalogModal('tops')" class="category-button">Tops</button>
      <button @click="openCatalogModal('bottoms')" class="category-button">Bottoms</button>
      <button @click="openCatalogModal('shoes')" class="category-button">Shoes</button>
      <button @click="openCatalogModal('accessories')" class="category-button">Accessories</button>
    </div>
    <button @click="openDonationBoxModal" class="donation-box-button">Donation Box</button>
    <CatalogModal v-if="isCatalogModalOpen && catalogType !== null" :type="catalogType" @close="closeCatalogModal" />
    <DonationBoxModal v-if="isDonationBoxModalOpen" @close="closeDonationBoxModal" />
    <CreateOutfitPostForm />
    <RouterLink to="/" class="home-link">Return to Home</RouterLink>
  </main>
</template>

<style scoped>
.closet-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--color-ash-gray); /* Background color */
  border-radius: 8px;
  text-align: center;
  font-family: Arial, sans-serif;
}

.closet-title {
  font-size: 2em;
  margin-bottom: 20px;
  color: var(--color-sage); /* Sage color for the title */
}

.category-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

/* Styling for Category Buttons */
.category-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  background-color: var(--color-moss-green); /* Moss green background */
  color: white;
  font-weight: bold;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.category-button:hover {
  background-color: #6c7a46; /* Darker moss green */
  transform: scale(1.05);
}

/* Styling for Donation Box Button */
.donation-box-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  background-color: var(--color-tan); /* Tan color */
  color: white;
  font-weight: bold;
  margin-bottom: 20px;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.donation-box-button:hover {
  background-color: #ab896c; /* Darker tan color */
  transform: scale(1.05);
}

/* Styling for Home Link Button */
.home-link {
  display: inline-block;
  margin-top: 30px;
  padding: 10px 15px;
  background-color: var(--color-sage); /* Sage background */
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1em;
  font-weight: bold;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.home-link:hover {
  background-color: #9aa97b; /* Darker shade of sage */
  transform: scale(1.05);
}
</style>
