<script setup>
import {ref, onBeforeMount} from 'vue'
import {useApi} from '@directus/extensions-sdk'

const api = useApi()
const places = ref([])
const placeSelected = ref(2)

async function getPlaces() {
  const response = await api.get("/items/place");
  places.value = response.data.data
}

onBeforeMount(() => {
  getPlaces()
})

</script>

<template>
  <select v-model="placeSelected" class="">
    <option v-for="place in places" :value="place.id" class="">
      {{ place.title }}
    </option>
  </select>
  <div>
    {{ placeSelected }}
  </div>
  <v-button
      class="action-preview"
      @click="$emit('addMovie')"
  >
    Ajouter un film
  </v-button>
</template>

<style scoped lang="scss">

</style>
