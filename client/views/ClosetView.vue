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
  <main>
    <h1>Closet</h1>
    <div>
      <button @click="openCatalogModal('tops')">Tops</button>
      <button @click="openCatalogModal('bottoms')">Bottoms</button>
      <button @click="openCatalogModal('shoes')">Shoes</button>
      <button @click="openCatalogModal('accessories')">Accessories</button>
    </div>
    <button @click="openDonationBoxModal">Donation Box</button>
    <CatalogModal v-if="isCatalogModalOpen && catalogType !== null" :type="catalogType" @close="closeCatalogModal" />
    <DonationBoxModal v-if="isDonationBoxModalOpen" @close="closeDonationBoxModal" />
    <CreateOutfitPostForm />
    <RouterLink to="/" class="button"> Return to the home page </RouterLink>
  </main>
</template>
