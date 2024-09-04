<script setup>
import {ref, watch} from 'vue'
import {useApi} from '@directus/extensions-sdk'

const emit = defineEmits(['movieAddedToPlace'])
const props = defineProps({
  placeSelected: Number
})
const api = useApi()
const movies = ref(Array)
const events = ref(Array)
const search = ref(null)
const searchMovies= ref(Array)
const searchEvents= ref(Array)
const tab = ref("movie")

watch(search, () => {
  searchFor(search)
})

function getLastMovies() {
  api.get("/items/movies?fields[]=id,title,places.places_id&limit=30"
  ).then((res) => {
    movies.value = res.data.data
  });
}

function getLastEvents() {
  api.get("/items/events?fields[]=id,title,places.places_id&limit=30").then((res) => {
    events.value = res.data.data
  });
}

function addMovieToPlace(id) {
  api.patch("/items/movies/" + id, {
    "places": {
      "create": [{"places_id": props.placeSelected}],
    }
  }).then(() => {
    emit('movieAddedToPlace')
    getLastMovies()
    searchFor(search)
  })
}

function addEventToPlace(id) {
  api.patch("/items/events/" + id, {
    "places": {
      "create": [{"places_id": props.placeSelected}],
    }
  }).then(() => {
    emit('movieAddedToPlace')
    getLastEvents()
    searchFor(search)
  })
}

function searchFor(search) {
  api.get("/items/movies?filter[title][_contains]=" + search.value + "&filter[title][_nempty]&fields[]=id,title,places.places_id"
  ).then((res) => {
    searchMovies.value = res.data.data
  });

  api.get("/items/events?filter[title][_contains]=" + search.value + "&filter[title][_nempty]&fields[]=id,title,places.places_id"
  ).then((res) => {
    searchEvents.value = res.data.data
  });
}

function isMovieDisable(movie) {
  return movie.places.find((e) => e.places_id === props.placeSelected)
}

function isEventDisable(event) {
  return event.places.find((e) => e.places_id === props.placeSelected)
}

getLastMovies()
getLastEvents()

</script>

<template>
  <div class="search">
    <v-input v-model="search" placehodler="Rechercher un film ou un événement"/>
    <div class="search__results" v-if="search">
      <div class="search__results__movies">
        <h3>Films</h3>
        <div v-for="movie in searchMovies">
          <VButton
              @click="addMovieToPlace(movie.id)"
              :rounded="true"
              :icon="true"
              :disabled="isMovieDisable(movie)"
          >
            <VIcon v-if="isMovieDisable(movie)" name="check"/>
            <VIcon v-if="!isMovieDisable(movie)" name="add"/>
          </VButton>
          {{ movie.title }}
        </div>
        <div v-if="searchMovies.length === 0">Aucun film trouvé</div>
      </div>
      <div class="search__results__events">
        <h3>Evénements</h3>
        <div v-for="event in searchEvents">
          <VButton
              @click="addEventToPlace(event.id)"
              :rounded="true"
              :icon="true"
              :disabled="isMovieDisable(event)"
          >
            <VIcon v-if="isEventDisable(event)" name="check"/>
            <VIcon v-if="!isEventDisable(event)" name="add"/>
          </VButton>
          {{ event.title }}
        </div>
        <div v-if="searchEvents.length === 0">Aucun événement trouvé</div>
      </div>
    </div>
  </div>


  <ul class="nav-tab">
    <button @click="tab = 'movie'">Films</button>
    <button @click="tab = 'event'">Événements</button>
  </ul>

  <div class="tab-movie" v-if="tab === 'movie'">
    <h3>Films</h3>
    <div v-for="movie in movies">
      <VButton
          @click="addMovieToPlace(movie.id)"
          :rounded="true"
          :icon="true"
          :disabled="isMovieDisable(movie)"
      >
        <VIcon v-if="isMovieDisable(movie)" name="check"/>
        <VIcon v-if="!isMovieDisable(movie)" name="add"/>
      </VButton>
      {{ movie.title }}
    </div>
  </div>
  <div class="tab-event" v-if="tab === 'event'">
    <h3>Événements</h3>
    <div v-for="event in events">
      <VButton
          @click="addEventToPlace(event.id)"
          :rounded="true"
          :icon="true"
          :disabled="isMovieDisable(event)"
      >
        <VIcon v-if="isEventDisable(event)" name="check"/>
        <VIcon v-if="!isEventDisable(event)" name="add"/>
      </VButton>
      {{ event.title }}
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
