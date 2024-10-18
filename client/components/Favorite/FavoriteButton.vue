<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps({
  initialFavorited: Boolean,
  itemId: String,
  userId: String,
});

const emit = defineEmits(["favoriteToggled"]);
const isFavorited = ref(props.initialFavorited);
const loading = ref(false);

const toggleFavorite = async () => {
  if (!props.userId || !props.itemId) {
    console.error("userId or itemId is undefined");
    return;
  }

  loading.value = true;
  try {
    if (isFavorited.value) {
      await fetchy(`/api/favorites/${props.itemId}`, "DELETE");
    } else {
      await fetchy(`/api/favorites/${props.itemId}`, "POST", {
        body: { userId: props.userId, itemId: props.itemId },
      });
    }
    isFavorited.value = !isFavorited.value;

    emit("favoriteToggled");
  } catch (error) {
    console.error("Error toggling favorite:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <button @click="toggleFavorite" :disabled="loading" :class="{ favorited: isFavorited }" class="favorite-btn">
    <span v-if="isFavorited">❤️</span>
    <span v-else>🤍</span>
  </button>
</template>

<style scoped>
.favorite-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.5rem;
}

.favorite-btn.favorited {
  color: red;
}
</style>
