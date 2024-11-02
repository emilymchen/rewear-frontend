<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const currentRoute = useRoute();
const router = useRouter();
const category = ref<string>(currentRoute.params.category as string);
const id = ref<string>(currentRoute.params.id as string);

const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());
const authorUsername = ref<string | null>(null);

const currentUserId = ref("");
const showModal = ref(false); // Controls the display of the confirmation modal

// Confirm delete action
async function confirmDelete() {
  try {
    // Delete from the catalog
    await fetchy(`/api/catalog/${id.value}`, "DELETE");

    // Delete from the donating concept
    await fetchy(`/api/donations/${id.value}/delete`, "DELETE");

    // Delete from the favoriting concept
    await fetchy(`/api/favorites/${id.value}/all`, "DELETE");

    // Redirect to the catalog page or any other page
    router.push("/closet");
  } catch (error) {
    console.error("Error deleting item:", error);
  } finally {
    showModal.value = false;
  }
}

// Cancel delete action
function cancelDelete() {
  showModal.value = false;
}

const fetchUserId = async () => {
  try {
    const result = await fetchy(`/api/users/${currentUsername.value}`, "GET");
    currentUserId.value = result._id;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

interface CatalogItem {
  userId: string;
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

const loaded = ref(false);
const catalogItem = ref<CatalogItem | null>(null); // Updated to hold a single CatalogItem or null
const donationStatus = ref<string | null>(null); // Store the donation status

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

// Fetch donation status of the item
async function getDonationStatus(id: string) {
  try {
    const result = await fetchy(`/api/donations/${id}`, "GET");
    donationStatus.value = result;
  } catch (error) {
    console.error("Error fetching donation status: ", error);
  }
}

async function getAuthorUsername() {
  try {
    if (catalogItem.value) {
      const result = await fetchy(`/api/userById/${catalogItem?.value.userId}`, "GET");
      console.log("Author username: ", result.username);
      authorUsername.value = result.username;
    }
  } catch (error) {
    console.error("Error fetching author username: ", error);
  }
}

// Start a new conversation with the owner
async function startConversation() {
  if (!isLoggedIn.value || !authorUsername.value) return;

  try {
    // Redirect to the conversation page, initiating a new message to the owner
    router.replace(`/inbox/${catalogItem.value?.userId}`);
  } catch (error) {
    console.error("Error starting a new conversation:", error);
  }
}

// List the item for donation
async function listForDonation() {
  if (!isLoggedIn.value) {
    alert("Please log in to list an item for donation.");
    return;
  }

  try {
    const result = await fetchy(`/api/donations/${id.value}`, "POST");
    donationStatus.value = "listed";
  } catch (error) {
    console.error("Error listing item for donation: ", error);
  }
}

// Unlist the item from donation
async function unlistForDonation() {
  try {
    const result = await fetchy(`/api/donations/${id.value}`, "DELETE");
    donationStatus.value = "not-listed";
  } catch (error) {
    console.error("Error unlisting item from donation: ", error);
  }
}

// Mark the item as donated
async function markAsDonated() {
  try {
    const result = await fetchy(`/api/donations/${id.value}/status`, "PATCH");
    donationStatus.value = "donated";
  } catch (error) {
    console.error("Error marking item as donated: ", error);
  }
}

const isOwner = computed(() => catalogItem.value?.userId === currentUserId.value);

onBeforeMount(async () => {
  await getCatalogItem(id.value);
  await getDonationStatus(id.value);
  await fetchUserId();
  await getAuthorUsername();
  loaded.value = true;
});
</script>

<template>
  <section v-if="catalogItem">
    <h1>{{ category }} - {{ catalogItem.name }}</h1>
    <p>Type: {{ catalogItem.type }}</p>
    <p>Color: {{ catalogItem.color }}</p>
    <img :src="catalogItem.photoUrl" alt="Catalog Item Image" v-if="catalogItem.photoUrl" width="500" />

    <!-- Show donation status and action buttons for the item -->
    <div v-if="isOwner">
      <p>Donation Status: {{ donationStatus || "Not listed" }}</p>

      <button v-if="donationStatus === 'not-listed'" @click="listForDonation">List for Donation</button>
      <button v-else-if="donationStatus === 'listed'" @click="unlistForDonation">Unlist from Donation</button>
      <button v-if="donationStatus === 'listed'" @click="markAsDonated">Mark as Donated</button>

      <!-- Delete Button -->
      <button @click="showModal = true" class="delete-button">Delete Item</button>

      <!-- Confirmation Modal -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <p>Are you sure you want to delete this item?</p>
          <button @click="confirmDelete" class="confirm-delete-button">Yes, Delete</button>
          <button @click="cancelDelete" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Owner: {{ authorUsername }}</p>
      <p>Donation Status: {{ donationStatus }}</p>
      <!-- Show link to start a new conversation if item is listed for donation -->
      <button v-if="donationStatus === 'listed'" @click="startConversation">Message Owner to Inquire About Donation</button>
    </div>
  </section>
  <p v-else>Loading...</p>
</template>

<style scoped>
button {
  margin: 5px;
  padding: 10px 15px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.delete-button:hover {
  background-color: #ff1a1a;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}

.confirm-delete-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  margin-right: 10px;
}

.confirm-delete-button:hover {
  background-color: #ff1a1a;
}

.cancel-button {
  background-color: #ccc;
  color: black;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.cancel-button:hover {
  background-color: #999;
}
</style>
