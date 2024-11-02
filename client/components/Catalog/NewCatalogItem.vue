<script setup lang="ts">
import { defineProps } from "vue";

// Props definition
const props = defineProps({
  type: String,
});
</script>

<template>
  <RouterLink :to="`/new/${props.type}`" class="NewClothingCard">
    <img src="@/assets/images/plus-button.svg" alt="Add New Item" />
  </RouterLink>
</template>

<style scoped>
.NewClothingCard {
  position: relative;
  z-index: 9005;
  width: calc(0.2 * 0.9 * (100vw - 20vh));
  height: calc(1.2 * 0.2 * 0.9 * (100vw - 20vh));
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(181, 128, 89, 58);
  border-radius: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
}
</style>
