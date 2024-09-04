<script setup>
import {ref, watch, onMounted} from 'vue'
import {useApi} from '@directus/extensions-sdk'
import {Draggable} from "@fullcalendar/interaction";

import { useCinopsStore } from '../stores/cinops';
const cinopsStore = useCinopsStore()

function setDraggableEvents() {
  let containerEl = document.getElementById("draggables");

  new Draggable(containerEl, {
    itemSelector: '.draggable-item'
  });
}

function eventData(item, type) {
  return JSON.stringify({
    'title': item.title,
    'element_id': item.id,
    'type': type,
    'duration': item.runtime ? new Date(item.runtime * 60 * 1000).toISOString().substring(11, 19) : null
  })
}

onMounted(() => {
  setDraggableEvents();
})

</script>

<template>
  <div id="draggables" class="place-items">
    <h3>Films</h3>
    <div class="draggable-item eitem" :data-event="eventData(movie, 'movies')" v-for="movie in cinopsStore.movies">
      <div class="eitem__wrapper">
        <div class="eitem__color">
          <div class="eitem__color__inner">
            <input type="color" name="eitem-color">
          </div>
        </div>
        <div class="eitem__detail">
          <div class="eitem__title">
            {{ movie.title }}
          </div>
          <div class="eitem__info">
          </div>
        </div>
      </div>
      <div class="eitem__actions">
        <span class="pills"><VIcon :small="true" name="timer"/> 100 min.</span>
        <span class="pills"><VIcon :small="true" name="event"/> 2</span>
        <button>
          <VIcon :small="true" name="visibility_off"/>
        </button>
        <button>
          <VIcon :small="true" name="table"/>
        </button>
        <button>
          <VIcon :small="true" name="edit"/>
        </button>
        <button>
          <VIcon :small="true" name="delete"/>
        </button>
      </div>
    </div>
    <h3>Événements</h3>
    <div class="draggable-item eitem" :data-event="eventData(event, 'events')" v-for="event in cinopsStore.events">
      {{ event.title }}
    </div>
  </div>
</template>

<style scoped lang="scss">
h3 {
  text-align: center;
  font-size: 0.8em;
  font-weight: 700;
}

.eitem {
  background-color: #fff;
  border-bottom: 3px solid #f0f4f9;
}

.eitem__wrapper {
  display: flex;
  align-items: center;
}

.eitem__detail {
  flex: 1;
  padding: 0 0 0.2rem 0;
}

.eitem__actions {
  flex: 0 0 auto;
  display: flex;
  justify-content: end;
  border-top: 1px solid #f0f4f9;

  button {
    border-left: 1px solid #f0f4f9;
  }
}

.eitem__color {
  padding: 0.5rem;
}

.eitem__color__inner {
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.eitem__color input {
  height: 1.7rem;
  width: 1.5rem;
  border: unset;
  padding: 0;
  margin: 0;
  flex: 0 0 auto;
}

.eitem__info {
  display: flex;
  gap: 0.2rem;
}

.pills {
  //background-color: rgb(243, 244, 246);
  padding: 0 0.5rem;
  font-size: .75rem;
  border-radius: .25rem;
  margin-right: auto;

}

.pills .v-icon {
  --v-icon-size: 10.5px;
}

</style>
