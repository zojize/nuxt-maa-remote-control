<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <main class="text-(dark:gray-200 teal-700 center) p-(x4 y10)">
    <div class="text-4xl">
      <div class="i-carbon-warning inline-block" />
    </div>
    <div>Not found</div>
    <div>
      <button class="text-sm m-(3 t8) btn" @click="router.back()">
        Back
      </button>
    </div>
  </main>
</template>
