<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchy } from "../../utils/fetchy";
import FavoriteButton from "./FavoriteButton.vue";

const props = defineProps({ userId: String });

interface FavoriteItem {
  id: string;
  itemId: string;
  favorited: boolean;
}

const favoriteItems = ref<FavoriteItem[]>([]);

const fetchFavorites = async () => {
  try {
    const response = await fetchy(`/api/favorites?userId=${props.userId}`, "GET");
    favoriteItems.value = await response;
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
};

const handleFavoriteToggled = ({ itemId, favorited }: { itemId: string; favorited: boolean }) => {
  if (!favorited) {
    favoriteItems.value = favoriteItems.value.filter((item) => item.id !== itemId);
  }
};

onMounted(fetchFavorites);
</script>

<template>
  <div>
    <h2>Your Favorite Items</h2>
    <ul>
      <li v-for="item in favoriteItems" :key="item.id">
        <span>{{ item.itemId }}</span>
        <FavoriteButton :initialFavorited="true" :itemId="item.id" :userId="props.userId" @favoriteToggled="handleFavoriteToggled" />
      </li>
    </ul>
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
