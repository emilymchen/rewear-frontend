<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

interface OotdPost {
  _id: string;
  caption: string;
  photoUrl: string;
  selectedItems: Array<{
    _id: string;
    name: string;
    color: string;
    category: string;
  }>;
  dateCreated: string;
  author: string;
}

interface CatalogItem {
  _id: string;
  photoUrl: string;
  name: string;
  color: string;
  category: string;
  max_wears: number;
}

const route = useRoute();
const router = useRouter();
const postId = route.params.id as string;

const post = ref<OotdPost | null>(null);
const catalogItems = ref<CatalogItem[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");

// Fetch the post data based on the postId from the route
const fetchPost = async () => {
  try {
    const result = await fetchy(`/api/posts/${postId}`, "GET");
    post.value = result;
    await fetchCatalogItems();
  } catch (error) {
    console.error("Error fetching OOTD post:", error);
    errorMessage.value = "Failed to load post. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

const fetchCatalogItems = async () => {
  if (!post.value) return;

  const itemDetails: CatalogItem[] = [];

  for (const itemId of post.value.selectedItems) {
    try {
      const item = await fetchy(`/api/catalog/${itemId}`, "GET");
      itemDetails.push(item);
    } catch (error) {
      console.error("Error fetching catalog item:", error);
    }
  }

  catalogItems.value = itemDetails;
};

// Navigate back
const goBack = () => {
  router.back();
};

onMounted(fetchPost);
</script>

<template>
  <main class="ootd-post">
    <!-- Back button -->
    <button class="back-button" @click="goBack">← Back</button>

    <!-- Loading and error states -->
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>

    <!-- Display post content when data is available -->
    <div v-else>
      <h1>OOTD Post by {{ post?.author }}</h1>

      <!-- Image preview -->
      <div class="image-container">
        <img :src="post?.photoUrl" alt="Outfit image" />
      </div>

      <!-- Caption and details -->
      <p class="caption">{{ post?.caption }}</p>
      <p v-if="post?.dateCreated" class="date">Posted on: {{ new Date(post.dateCreated).toLocaleDateString() }}</p>

      <!-- Selected clothing items -->
      <h2>Clothing Items</h2>
      <ul class="clothing-items">
        <li v-for="item in catalogItems" :key="item._id" class="clothing-item">
          <p><strong>Name:</strong> {{ item.name }}</p>
          <p><strong>Category:</strong> {{ item.category }}</p>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
.ootd-post {
  max-width: 600px;
  margin: 2em auto; /* Added top margin */
  padding: 1em;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

/* .back-button {
  display: inline-block;
  margin-bottom: 1em;
  padding: 0.5em 1em;
  font-size: 1em;
  color: #007bff;
  background: none;
  border: 1px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
} */
.back-button {
  background-color: transparent;
  color: #007bff;
  border: none;
  font-size: 1em;
  cursor: pointer;
  margin-bottom: 1em;
  transition: color 0.3s;
}

.back-button:hover {
  color: #0056b3;
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

.caption {
  font-size: 1.2em;
  margin-bottom: 0.5em;
}

.date {
  font-size: 0.9em;
  color: #888;
  margin-bottom: 1em;
}

.clothing-items {
  list-style-type: none;
  padding: 0;
}

.clothing-item {
  background-color: #fff;
  padding: 0.8em;
  margin-bottom: 0.5em;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.clothing-item p {
  margin: 0.3em 0;
}
</style>
