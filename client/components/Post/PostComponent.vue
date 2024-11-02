<!-- src/components/Feed/Post.vue -->
<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineProps, onBeforeMount, ref } from "vue";

interface ClothingItem {
  _id: string;
  name: string;
  color: string;
  category: string;
  photoUrl: string;
}

interface PostData {
  _id: string;
  author: string;
  caption: string;
  photoUrl: string;
  selectedItems: ClothingItem[];
  dateCreated: string;
  favorited: boolean;
}

const props = defineProps<{ post: PostData }>();
const isFavorited = ref(props.post.favorited);
const catalogItems = ref<ClothingItem[]>([]);

async function toggleFavorite() {
  try {
    if (isFavorited.value) {
      await fetchy(`/api/favorites/${props.post._id}`, "DELETE");
      isFavorited.value = false;
    } else {
      await fetchy(`/api/favorites/${props.post._id}`, "POST");
      isFavorited.value = true;
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
  }
}

async function getCatalogItems() {
  for (const item of props.post.selectedItems) {
    try {
      const result = await fetchy(`/api/catalog/${item}`, "GET");
      catalogItems.value.push(result);
    } catch (error) {
      console.error("Error fetching catalog item:", error);
    }
  }
}

onBeforeMount(() => {
  getCatalogItems();
});
</script>

<template>
  <router-link :to="`/ootd/${post._id}`">
    <article class="post-card">
      <header class="post-header">
        <p class="author">Posted by {{ props.post.author }}</p>
        <p class="date">{{ new Date(props.post.dateCreated).toLocaleDateString() }}</p>
      </header>

      <div class="post-image">
        <img :src="props.post.photoUrl" alt="Post image" />
      </div>

      <p class="caption">{{ props.post.caption }}</p>

      <div class="clothing-items">
        <h3>Outfit Items:</h3>
        <ul>
          <li v-for="item in catalogItems" :key="item._id" class="clothing-item">
            <img :src="item.photoUrl" alt="Clothing item image" class="item-image" width="50px" />
            <p>
              <strong>{{ item.name }}</strong> - {{ item.color }} ({{ item.category }})
            </p>
          </li>
        </ul>
      </div>

      <!-- Favorite Button -->
      <button @click="toggleFavorite" :class="{ favorited: isFavorited }">
        {{ isFavorited ? "Unfavorite" : "Favorite" }}
      </button>
      <button @click="$emit('delete-post', props.post._id)">Delete Post</button>
    </article>
  </router-link>
</template>

<style scoped>
button {
  background-color: transparent;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 1em;
}

button.favorited {
  color: #d9534f;
}

button:hover {
  text-decoration: underline;
}
</style>
