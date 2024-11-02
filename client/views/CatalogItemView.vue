<script setup lang="ts">
import { useUserStore } from "@/stores/user"; // Assuming you have a Pinia store for user auth
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

interface ClothingItem {
  _id: string;
  name: string;
  color: string;
  category: string;
  max_wears: number;
  photoUrl: string;
  userId: string; // ID of the author
}

const route = useRoute();
const itemId = route.params.id as string;

const item = ref<ClothingItem | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

// Set up refs for editing
const isEditing = ref(false);
const editedItem = ref<Partial<ClothingItem>>({});

// Use Pinia store to access current user
const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);
const currentUserId = ref("");

const fetchUserId = async () => {
  try {
    const result = await fetchy(`/api/users/${currentUsername.value}`, "GET");
    console.log(result);
    currentUserId.value = result._id;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

// Check if the current user is the author of the item
const isAuthor = computed(() => currentUserId.value === item.value?.userId);
console.log(currentUserId.value);
console.log(item.value?.userId);

// Fetch clothing item data
const fetchItem = async () => {
  try {
    const result = await fetchy(`/api/catalog/${itemId}`, "GET");
    item.value = result;
    editedItem.value = { ...result }; // Initialize editedItem with current item data
  } catch (error) {
    console.error("Error fetching clothing item:", error);
    errorMessage.value = "Failed to load item. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

// Save changes to the item
const saveChanges = async () => {
  try {
    await fetchy(`/api/catalog/${itemId}`, "PUT", {
      body: editedItem.value,
    });
    console.log(item.value);
    item.value = { ...item.value, ...editedItem.value }; // Update item with new data
    isEditing.value = false;
  } catch (error) {
    console.error("Error saving changes:", error);
    alert("Failed to save changes. Please try again.");
  }
};

onMounted(fetchItem);
onBeforeMount(fetchUserId);
</script>

<template>
  <section class="clothing-item-page">
    <!-- Loading and error states -->
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>

    <!-- Display item content when data is available -->
    <div v-else>
      <h1>Clothing Item</h1>

      <!-- Image preview -->
      <div class="image-container">
        <img :src="item?.photoUrl" alt="Clothing item image" />
      </div>

      <!-- Editable fields if the user is the author -->
      <div v-if="isAuthor">
        <button v-if="!isEditing" @click="isEditing = true">Edit Item</button>
        <div v-else>
          <label>
            Name:
            <input v-model="editedItem.name" />
          </label>
          <label>
            Color:
            <input v-model="editedItem.color" />
          </label>
          <label>
            Category:
            <input v-model="editedItem.category" />
          </label>
          <label>
            Max Wears:
            <input type="number" v-model="editedItem.max_wears" />
          </label>
          <label>
            Photo URL:
            <input v-model="editedItem.photoUrl" />
          </label>
          <button @click="saveChanges">Save Changes</button>
          <button @click="isEditing = false">Cancel</button>
        </div>
      </div>

      <!-- Read-only fields if the user is not the author -->
      <div v-else>
        <p><strong>Name:</strong> {{ item?.name }}</p>
        <p><strong>Color:</strong> {{ item?.color }}</p>
        <p><strong>Category:</strong> {{ item?.category }}</p>
        <p><strong>Max Wears:</strong> {{ item?.max_wears }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.clothing-item-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 1em;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.loading,
.error {
  text-align: center;
  font-size: 1.2em;
  color: #666;
}

.image-container img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 1em;
}

label {
  display: block;
  margin-bottom: 0.5em;
}

label input {
  width: 100%;
  padding: 0.5em;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  margin-top: 1em;
  padding: 0.7em 1em;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
