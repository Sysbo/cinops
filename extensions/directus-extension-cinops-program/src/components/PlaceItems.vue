<script setup>
import {ref, watch, onMounted} from 'vue'
import {useApi} from '@directus/extensions-sdk'
import {Draggable} from "@fullcalendar/interaction";

const props = defineProps({
  movies: Array,
  events: Array
})
const api = useApi()

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
    <div class="draggable-item" :data-event="eventData(movie)" v-for="movie in props.movies">
      {{ movie.title }}
    </div>
    <h3>Événements</h3>
    <div class="draggable-item" :data-event="eventData(event)" v-for="event in props.events">
      {{ event.title }}
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
