<script setup lang="ts">
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchPostForm from "./SearchPostForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
const posts = ref<PostData[]>([]);
let editing = ref("");
let searchAuthor = ref("");

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

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  posts.value = postResults;
}

const updateEditing = (id: string) => {
  editing.value = id;
};

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>
  <div class="posts-page">
    <!-- Header Section for Search and Title -->
    <div class="header">
      <h2 v-if="searchAuthor">Posts by {{ searchAuthor }}:</h2>
      <SearchPostForm @getPostsByAuthor="getPosts" />
    </div>

    <!-- Posts Section -->
    <section class="posts" v-if="loaded && posts.length !== 0">
      <article v-for="post in posts" :key="post._id" class="post-card">
        <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
        <EditPostForm v-else :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
      </article>
    </section>

    <!-- Messages for No Posts or Loading -->
    <p v-else-if="loaded" class="no-posts">No posts found</p>
    <p v-else class="loading">Loading...</p>
  </div>
</template>

<style scoped>
.posts-page {
  padding: 2em;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #bbc3ac; /* Background color from color scheme */
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5em;
  width: 100%;
  max-width: 1200px;
}

.header h2 {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--color-moss-green); /* Accent color for header */
}

.posts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5em;
  max-width: 1200px;
  margin: 0 auto;
  justify-items: center; /* Center grid items within each column */
}

.post-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5em;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
}

.no-posts,
.loading {
  text-align: center;
  font-size: 1.2em;
  color: var(--color-sage); /* Color for no posts/loading message */
  margin-top: 2em;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header h2 {
    margin-bottom: 1em;
  }
}
</style>
