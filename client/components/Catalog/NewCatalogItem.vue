<script setup lang="ts">
import { defineProps } from "vue";

// Props definition
const props = defineProps({
  type: String,
});
</script>

<template>
  <RouterLink :to="`/new/${props.type}`" class="new-clothing-card">
    <span class="plus-symbol">+</span>
  </RouterLink>
</template>

<style scoped>
.new-clothing-card {
  position: relative;
  z-index: 9005;
  width: 160px;
  height: 220px;
  background-color: #f0f0f0;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.3s ease,
    background-color 0.3s ease;
  text-decoration: none;
}

.new-clothing-card:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
}

.plus-symbol {
  font-size: 3em;
  font-weight: bold;
  color: #888888; /* Muted brown tone to match the theme */
}
</style>
