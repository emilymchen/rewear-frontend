<!-- src/components/Feed/Post.vue -->
<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
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

const emit = defineEmits(["refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());
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

async function deletePost() {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
}

onBeforeMount(() => {
  getCatalogItems();
});
</script>

<template>
  <article class="post-card">
    <router-link :to="`/ootd/${post._id}`" class="post-link">
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
    </router-link>
    <div class="action-buttons">
      <button @click.stop="toggleFavorite" :class="{ favorited: isFavorited }">
        {{ isFavorited ? "Unfavorite" : "Favorite" }}
      </button>
      <button @click.stop="deletePost" v-if="currentUsername === props.post.author">Delete Post</button>
    </div>
  </article>
</template>

<style scoped>
.post-link {
  text-decoration: none;
  color: inherit; /* Keeps the link color consistent with the card styling */
}

.post-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  margin: 1em;
  padding: 1em;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #888;
  margin-bottom: 0.5em;
}

.post-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.caption {
  font-size: 1em;
  color: #333;
  margin: 0.5em 0 1em;
}

.clothing-items {
  margin-top: 1em;
}

.clothing-items h3 {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 0.5em;
}

.clothing-item {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
}

.item-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.action-buttons {
  display: flex;
  gap: 1em;
  margin-top: 1em;
}

button {
  background-color: transparent;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 1em;
  transition: color 0.3s ease;
}

button.favorited {
  color: #d9534f;
}

button:hover {
  color: #0056b3;
}

button.favorited:hover {
  color: #c9302c;
}
</style>
