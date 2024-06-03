<script setup>
import {ref, watch, onMounted} from 'vue'
import {useApi} from '@directus/extensions-sdk'
import {Draggable} from "@fullcalendar/interaction";

const props = defineProps({
  placeSelected: Number
})
const api = useApi()
const movies = ref(null)
const events = ref(null)

getPlaceMovies()
getPlaceEvents()

watch(() => props.placeSelected, () => {
  getPlaceMovies()
  getPlaceEvents()
})

function getPlaceMovies() {
  api.get("/items/movie?filter[places][place_id][_eq]=" +
      props.placeSelected).then((res) => {
    movies.value = res.data.data
  });
}

function getPlaceEvents() {
  api.get("/items/event?filter[places][place_id][_eq]=" +
      props.placeSelected).then((res) => {
    events.value = res.data.data
  });
}

function setDraggableEvents() {
  let containerEl = document.getElementById("draggables");

  new Draggable(containerEl, {
    itemSelector: '.draggable-item'
  });
}

function eventData(item) {
  return JSON.stringify({
    'title': item.title,
    'movie_id': item.id,
    'duration': item.runtime ? new Date(item.runtime * 60 * 1000).toISOString().substring(11, 19) : null})
}

onMounted(() => {
  setDraggableEvents();
})

</script>

<template>
  <div id="draggables">
    <h3>Films</h3>
    <div class="draggable-item" :data-event="eventData(movie)" v-for="movie in movies">
      {{ movie.title }}
    </div>
    <h3>Événements</h3>
    <div class="draggable-item" :data-event="eventData(event)" v-for="event in events">
      {{ event.title }}
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
