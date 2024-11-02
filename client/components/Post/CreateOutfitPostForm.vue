<script setup lang="ts">
import CatalogSelectionModal from "@/components/Catalog/CatalogSelectionModal.vue";
import { computed, onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

interface ClothingArticle {
  _id: string;
  photoUrl: string;
  name: string;
  color: string;
  category: string;
  max_wears: number;
}

const emit = defineEmits(["refreshPosts"]);
const caption = ref("");
const photoUrl = ref(""); // Field for photo URL
const selectedItems = ref<string[]>([]);
const isSubmitting = ref(false);
const catalogItems = ref<ClothingArticle[]>([]);
const showModal = ref(false);

// Computed property to validate if the photo URL is not empty and starts with "http" (basic validation)
const isValidPhotoUrl = computed(() => photoUrl.value !== "" && photoUrl.value.startsWith("http"));

async function getCatalogItems() {
  try {
    const getResults = await fetchy("/api/catalog", "GET");
    catalogItems.value = getResults;
  } catch (error) {
    console.error("Error fetching catalog items: ", error);
  }
}

const createPost = async () => {
  console.log(selectedItems.value);
  console.log(selectedItems.value.length);

  // Validate all required fields
  if (caption.value.trim() === "" || selectedItems.value.length === 0 || !isValidPhotoUrl.value) {
    alert("Please complete all fields with valid values before submitting.");
    return;
  }

  isSubmitting.value = true;

  try {
    await fetchy("/api/posts", "POST", {
      body: {
        caption: caption.value,
        photoUrl: photoUrl.value, // Include the photo URL in the payload
        selectedItems: selectedItems.value,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
  } finally {
    isSubmitting.value = false;
  }

  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  caption.value = "";
  photoUrl.value = ""; // Reset the photo URL field
  selectedItems.value = [];
};

onBeforeMount(getCatalogItems);
</script>

<template>
  <form @submit.prevent="createPost">
    <label for="content">Post your OOTD!</label>
    <textarea id="content" v-model="caption" placeholder="Create a post!" required></textarea>

    <!-- New field for Photo URL -->
    <label for="photoUrl">Photo URL:</label>
    <input id="photoUrl" v-model="photoUrl" placeholder="Enter the photo URL" required :class="{ 'input-error': !isValidPhotoUrl && photoUrl }" />

    <!-- Outfit Image Preview -->
    <div v-if="isValidPhotoUrl" class="img-preview-container">
      <h2>Outfit Image Preview</h2>
      <img :src="photoUrl" alt="Preview of outfit image" class="img-preview" />
    </div>

    <!-- Button to open modal -->
    <button type="button" @click="showModal = true">Select Clothing Items</button>

    <!-- Display selected items -->
    <ul>
      <li v-for="id in selectedItems" :key="id">{{ catalogItems.find((item) => item._id === id)?.name }}</li>
    </ul>

    <button type="submit" :disabled="isSubmitting">Create Post</button>

    <!-- Modal Component -->
    <CatalogSelectionModal
      v-if="showModal"
      :catalogItems="catalogItems"
      :selectedItems="selectedItems"
      :showModal="showModal"
      @update:selectedItems="(items) => (selectedItems = items)"
      @closeModal="showModal = false"
    />
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea,
input {
  font-family: inherit;
  font-size: inherit;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

input {
  border: 1px solid #ccc;
}

button {
  padding: 0.7em;
  background-color: #6c7a46;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.img-preview-container {
  margin-top: 1em;
  text-align: center;
}

.img-preview {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-error {
  border-color: red;
}
</style>
