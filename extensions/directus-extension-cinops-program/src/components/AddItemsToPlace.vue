<script setup>
import {ref} from 'vue'
import {useApi} from '@directus/extensions-sdk'

const props = defineProps({
  placeSelected: Number
})
const api = useApi()
const movies = ref(null)
const events = ref(null)
const search = ref(null)

function getLastMovies() {
  api.get("/items/movie?fields[]=id,title,places.place_id"
  ).then((res) => {
    movies.value = res.data.data
  });
}

function getLastEvents() {
  api.get("/items/event").then((res) => {
    events.value = res.data.data
  });
}

function addMovieToPlace(id) {
  api.patch("/items/place/" + props.placeSelected, {
    "movies": {
      "create": [{ "movie_id": id }],
    }
  })
}

function isMovieDisable(movie) {
  console.log(movie)
  return movie.places.find((e) => e.place_id === props.placeSelected)
}

getLastMovies()
getLastEvents()

</script>

<template>
  <v-input v-model="search"/>
  <h3>Films</h3>
  <div class="draggable-event" v-for="movie in movies">
    <VButton
        @click="addMovieToPlace(movie.id); $emit('movieAddedToPlace')"
        :rounded="true"
        :icon="true"
        :disabled="isMovieDisable(movie)"
    >
      <VIcon v-if="isMovieDisable(movie)" name="check"/>
      <VIcon v-if="!isMovieDisable(movie)" name="add"/>
    </VButton>
    {{ movie.title }}
  </div>
  <h3>Événements</h3>
  <ul>
    <div class="draggable-event" v-for="event in events">
      {{ event.title }}
    </div>
  </ul>
</template>

<style scoped lang="scss">

</style>
