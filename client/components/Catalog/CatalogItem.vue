<script setup lang="ts">
import { computed, defineProps } from "vue";

// Props definition
const props = defineProps({
  type: String,
  id: String,
  name: String,
  photoUrl: String,
});

const link = computed(() => `/view/${props.type}/${props.id}`);
</script>

<template>
  <router-link :to="link" class="catalog-item">
    <img :src="props.photoUrl" alt="Image of clothing item" class="item-image" />
    <div class="item-details">
      <p class="item-name">{{ props.name }}</p>
      <p class="item-type">{{ props.type }}</p>
    </div>
  </router-link>
</template>

<style scoped>
.catalog-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 140px;
  height: 200px;
  padding: 15px;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease; /* Smooth hover effect */
  text-decoration: none;
  color: inherit;
}

.catalog-item:hover {
  transform: scale(1.05); /* Slightly enlarge on hover */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15); /* Darker shadow on hover */
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.item-details {
  text-align: center;
}

.item-name {
  font-weight: 600;
  font-size: 1em;
  color: #333;
  margin: 4px 0;
}

.item-color {
  font-size: 0.9em;
  color: #777;
}

.item-type {
  font-size: 0.9em;
  color: #999;
}
</style>
