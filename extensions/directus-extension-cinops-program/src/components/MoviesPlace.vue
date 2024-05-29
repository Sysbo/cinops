<script setup>
import {ref, onBeforeMount} from 'vue'
import {useApi} from '@directus/extensions-sdk'

const api = useApi()
const movies = ref([])
const placeSelected = ref(2)

async function getPlaces() {
  const response = await api.get("/items/movie?filter[places][place_id][_eq]=" +
      placeSelected.value);
  movies.value = response.data.data
}

onBeforeMount(() => {
  getPlaces()
})

</script>

<template>
  <h3>Films</h3>
  <ul>
    <li v-for="movie in movies">
      {{ movie.title }}
    </li>
  </ul>
  <div>
  </div>
</template>

<style scoped lang="scss">

</style>
