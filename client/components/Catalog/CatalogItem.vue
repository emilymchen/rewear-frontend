<script setup lang="ts">
import { computed, defineProps } from "vue";

// Props definition
const props = defineProps({
  type: String,
  id: String,
  name: String,
  color: String,
  photoUrl: String,
});

console.log(props);

const link = computed(() => `/view/${props.type}/${props.id}`);
</script>

<template>
  <router-link :to="link" class="catalog-item">
    <img :src="props.photoUrl" alt="Image of clothing item" class="item-image" />
    <div class="item-details">
      <p class="item-name">{{ name }}</p>
      <p class="item-color">{{ color }}</p>
      <p class="item-type">{{ type }}</p>
    </div>
  </router-link>
</template>

<style scoped>
.catalog-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f3f3f3;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  text-align: center;
  margin-top: 8px;
}

.item-name {
  font-weight: bold;
  font-size: 0.9em;
}

.item-color,
.item-type {
  font-size: 0.8em;
  color: #666;
}
</style>
