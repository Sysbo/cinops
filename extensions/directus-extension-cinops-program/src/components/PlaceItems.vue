<script setup>
import {ref, watch, onMounted} from 'vue'
import {useApi} from '@directus/extensions-sdk'
import {Draggable} from "@fullcalendar/interaction";

import { useCinopsStore } from '../stores/cinops';
const cinopsStore = useCinopsStore()

const api = useApi()

function setDraggableEvents() {
  let containerEl = document.getElementById("draggables");

  new Draggable(containerEl, {
    itemSelector: '.draggable-item'
  });
}

function eventData(item, type) {
  return JSON.stringify({
    'title': item.item.title,
    'element_id': item.item.id,
    'type': item.collection,
    'duration': item.item.runtime ? new Date(item.item.runtime * 60 * 1000).toISOString().substring(11, 19) : null
  })
}

function setItemColor(e, item) {
  api.patch("/items/places_items/" + item.id, {
    'color': e.target.value
  })
}

onMounted(() => {
  setDraggableEvents();
})

</script>

<template>
  <div id="draggables" class="place-items">
    <div class="draggable-item eitem" :data-event="eventData(item)" v-for="item in cinopsStore.place.items">
      <div class="eitem__wrapper">
        <div class="eitem__color">
          <div class="eitem__color__inner">
            <input @change="e => setItemColor(e,item)" type="color" v-model="item.color" name="eitem-color">
          </div>
        </div>
        <div class="eitem__detail">
          <div class="eitem__title">
            {{ item.item.title }}
            <div class="eitem__info">
              <span class="pills"><VIcon :small="true" name="timer"/> {{item.item.runtime}} min.</span>
              <span class="pills"><VIcon :small="true" name="event"/> 2</span>
            </div>
          </div>
          <div class="eitem__actions">
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
      </div>
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
  border-top: 2px solid #f0f4f9;
  border-right: 2px solid #f0f4f9;
  //border-bottom: 5px solid #f0f4f9;
  //margin: 0 0.5rem;
}

.eitem__wrapper {
  display: flex;
  justify-content: stretch;
  //align-items: center;
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
  //padding: 0.5rem;
}

.eitem__color__inner {
  height: 100%;
  width: 0.6rem;
  //border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.eitem__color input {
  height: 120%;
  width: 1rem;
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
