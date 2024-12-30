<script setup>
import {ref, watch, onMounted} from 'vue'
import {useApi} from '@directus/extensions-sdk'
import {Draggable} from "@fullcalendar/interaction";

import {useCinopsStore} from '../stores/cinops';

const cinopsStore = useCinopsStore()

const itemId = ref(null)
const itemCollection = ref(null)
const itemDrawerActive = ref(false)

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
  }).then(() => {
    cinopsStore.getPlace()
  })
}

function getItemSessions(item) {
  api.get("/items/sessions_items?filter[item][_eq]=" + item.item.id + "&fields[]=id").then((res) => {
    console.log(res.data.data.length)
    return res.data.data.length
  });
}

function itemEdit(item) {
  itemDrawerActive.value = true
  itemId.value = item.item.id
  itemCollection.value = item.collection
}

function itemUpdate(item) {
  api.patch("/items/sessions/" + item.id, item)
      .then(() => {
        cinopsStore.getPlace()
      })
}

function itemVisibility(item) {
  api.patch("/items/places_items/" + item.id, {
    'publish': !item.publish
  })
      .then(() => {
        cinopsStore.getPlace()
      })
}

function itemTimetable(item) {
  api.patch("/items/places_items/" + item.id, {
    'timetable': !item.timetable
  })
      .then(() => {
        cinopsStore.getPlace()
      })
}

function itemDelete(item) {
  if (confirm("Retirer le film du cinéma ?") === false) {
    return
  }
  api.delete("/items/places_items/" + item.id)
      .then(() => {
        cinopsStore.getPlace()
      })
}

onMounted(() => {
  setDraggableEvents();
})

</script>

<template>
  <div id="draggables" class="place-items">
    <div :class="item.item.runtime > 0 ? 'draggable-item eitem' : 'eitem'" :data-event="eventData(item)"
         v-for="item in cinopsStore.place.items">
      <div class="eitem__wrapper">
        <div class="eitem__color">
          <div class="eitem__color__inner">
            <input @change="e => setItemColor(e,item)" type="color" v-model="item.color" name="eitem-color">
          </div>
        </div>
        <div class="eitem__visibility">
          <button>
            <VIcon @click="itemVisibility(item)" :small="true" :name="item.publish ? 'visibility' : 'visibility_off'"
                   :color="item.publish ? '#84cc16' : 'inherit' "/>
          </button>
        </div>
        <div class="eitem__timetable">
          <button>
            <VIcon @click="itemTimetable(item)" :small="true" name="table"
                   :color="item.timetable ? '#84cc16' : 'inherit' "/>
          </button>
        </div>
        <div class="eitem__detail">
          <div class="eitem__title">
            {{ item.item.title }}
            <div class="eitem__info">
              <span class="pills"><VIcon :small="true" name="timer"/> {{ item.item.runtime }} min.</span>
              <!--<span class="pills"><VIcon :small="true" name="event"/> {{ 2 }}</span>-->
            </div>
          </div>
        </div>
        <div class="eitem__actions">
          <button>
            <VIcon @click="itemEdit(item)" :small="true" name="edit"/>
          </button>
          <button>
            <VIcon @click="itemDelete(item)" :small="true" name="close"/>
          </button>
        </div>
      </div>
    </div>
  </div>
  <drawer-item v-if="itemId" @input="itemUpdate" @update:active="itemDrawerActive=false"
               :collection="itemCollection"
               :active="itemDrawerActive" :primaryKey="itemId"/>
</template>

<style scoped lang="scss">
.place-items {
  display: flex;
  flex-flow: column;
  //gap: 0.3rem;
}

.draggable-item.eitem {
  cursor: grab;
  opacity: 1;
}

.eitem {
  //background-color: var(--theme--border-color-subdued);
  border-top: 2px solid var(--theme--border-color-subdued);
  border-right: 2px solid var(--theme--border-color-subdued);
  border-left: 2px solid var(--theme--border-color-subdued);
  opacity: 0.8;
  //padding: 0.3rem;
  //border-top: 2px solid #f0f4f9;
  //border-right: 2px solid #f0f4f9;
  //border-bottom: 5px solid #f0f4f9;
  //margin: 0 0.5rem;
}

.eitem__detail {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 0;
}

.eitem__title {
  line-height: normal;
  color: var(--black);
  font-size: 0.9rem;
}

.eitem__wrapper {
  display: flex;
  //justify-content: stretch;
  //align-items: center;
}

.eitem__color {
  display: flex;
}

.eitem__visibility {
  display: flex;
  padding: 0.2rem 0.2rem 0.2rem 0.4rem;
}

.eitem__timetable {
  display: flex;
  padding: 0.2rem;
}

.eitem__color__inner {
  height: 100%;
  width: 0.7rem;
  //border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.eitem__color input {
  height: 130%;
  width: 2rem;
  border: unset;
  padding: 0;
  margin: 0;
  flex: 0 0 auto;
  cursor: pointer;
}

.eitem__actions {
  display: flex;
  align-items: start;
}

.eitem__actions .v-icon {
  --v-icon-size: 15px;
}

.eitem__info {
  display: flex;
  gap: 0.3rem;
}

.pills {
  background-color: var(--theme--border-color-subdued);
  padding: 0.2rem 0.3rem;
  font-size: .75rem;
  border-radius: .25rem;
}

.pills .v-icon {
  --v-icon-size: 10.5px;
}


/*
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
}*/

</style>
