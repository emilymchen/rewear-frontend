<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);

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

const posts = ref<PostData[]>([]);

async function getFavoritedPosts() {
  let postResults;
  try {
    postResults = await fetchy("/api/favorites", "GET");
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
  posts.value = postResults;
}

onBeforeMount(async () => {
  await getFavoritedPosts();
  console.log(posts.value);
  loaded.value = true;
});
</script>

<template>
  <div class="posts-page">
    <h2>Your Favorite Items</h2>

    <!-- Posts Section -->
    <section class="posts" v-if="loaded && posts.length !== 0">
      <article v-for="post in posts" :key="post.id" class="post-card">
        <PostComponent :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
      </article>
    </section>

    <!-- Messages for No Posts or Loading -->
    <p v-else-if="loaded" class="no-posts">No posts found</p>
    <p v-else class="loading">Loading...</p>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

span {
  margin-right: 10px;
}
</style>
