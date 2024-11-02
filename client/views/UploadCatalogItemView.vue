<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const currentRoute = useRoute();

// Define refs for reactive state
const itemName = ref<string>("");
const imageURL = ref<string>("");

const category = ref<string>(currentRoute.params.category as string);
const emit = defineEmits(["refreshCatalog"]);

// Directly use imageURL for preview and submission
const isValidImageURL = computed(() => imageURL.value !== "" && imageURL.value.startsWith("http"));

const submitItem = async (): Promise<void> => {
  if (!itemName.value || !isValidImageURL.value || !category.value) {
    alert("Please complete all fields with valid values before submitting.");
    return;
  }

  try {
    await fetchy("/api/catalog", "POST", {
      body: {
        name: itemName.value,
        category: category.value,
        photoUrl: imageURL.value,
      },
    });

    emptyForm();
    emit("refreshCatalog");
  } catch (error) {
    console.error("Error uploading item:", error);
    alert("Error uploading item. Please try again.");
  }
};

const emptyForm = () => {
  itemName.value = "";
  imageURL.value = "";
};
</script>

<template>
  <main>
    <form @submit.prevent="submitItem">
      <label for="itemName">Item Name:</label>
      <input id="itemName" v-model="itemName" placeholder="Enter item name" required />

      <label for="imageURL">Image URL:</label>
      <input id="imageURL" v-model="imageURL" placeholder="Enter image URL" required />

      <!-- Display the image preview if the URL is valid -->
      <div v-if="isValidImageURL">
        <h2>Image Preview</h2>
        <img :src="imageURL" alt="Preview of uploaded item" />
      </div>

      <button type="submit">Upload Item</button>
    </form>
  </main>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1em;
  background-color: var(--base-bg);
  border-radius: 8px;
}

label {
  font-weight: bold;
}

input {
  padding: 0.5em;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  padding: 0.7em;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

img {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
