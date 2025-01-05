<script setup>
import {ref, watch} from 'vue'
import {useApi} from '@directus/extensions-sdk'
import {useCinopsStore} from '../stores/cinops';
import uniqolor from 'uniqolor';

const cinopsStore = useCinopsStore()
const api = useApi()
const movies = ref(Array)
const events = ref(Array)
const search = ref("")
const searchMovies = ref(Array)
const searchEvents = ref(Array)
const tab = ref([0])

watch(search, () => {
  searchFor(search)
})

function getLastMovies() {
  api.get("/items/movies?fields[]=id,title,places.places_id&limit=30&sort[]=-date_created"
  ).then((res) => {
    movies.value = res.data.data
  });
}

function getLastEvents() {
  api.get("/items/events?fields[]=id,title,places.places_id&limit=30&sort[]=-date_created").then((res) => {
    events.value = res.data.data
  });
}

function addItemToPlace(item, type) {
  api.patch("/items/places/" + cinopsStore.place.id, {
    "items": {
      "create": [{
        "item": {
          "id": item.id
        },
        "collection": type,
        "color": uniqolor.random().color
      }],
    }
  }).then(() => {
    getLastMovies()
    getLastEvents()
    searchFor(search)
    cinopsStore.getPlace()
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

function isItemDisable(item) {
  return cinopsStore.place.items.find((e) => e.item.id === item.id)
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
              @click="addItemToPlace(movie, 'movies')"
              :rounded="true"
              :icon="true"
              :small="true"
              :disabled="isItemDisable(movie)"
          >
            <VIcon :name="isItemDisable(movie) ? 'check' : 'add'" :small="true"/>
          </VButton>
          {{ movie.title }}
        </div>
        <div v-if="searchMovies.length === 0">Aucun film trouvé</div>
      </div>
      <div class="search__results__events">
        <h3>Evénements</h3>
        <div v-for="event in searchEvents">
          <VButton
              @click="addItemToPlace(event, 'events')"
              :rounded="true"
              :icon="true"
              :small="true"
              :disabled="isItemDisable(event)"
          >
            <VIcon :name="isItemDisable(event) ? 'check' : 'add'" :small="true"/>
          </VButton>
          {{ event.title }}
        </div>
        <div v-if="searchEvents.length === 0">Aucun événement trouvé</div>
      </div>
    </div>
  </div>

  <div class="last-items" v-if="!search">
    <VTabs v-model="tab">
      <VTab>
        Films
      </VTab>
      <VTab>
        Événements
      </VTab>
    </VTabs>

    <VTabsItems :model-value="tab">
      <VTabItem>
        <div v-for="movie in movies">
          <VButton
              @click="addItemToPlace(movie, 'movies')"
              :rounded="true"
              :icon="true"
              :small="true"
              :disabled="isItemDisable(movie)"
          >
            <VIcon :name="isItemDisable(movie) ? 'check' : 'add'" :small="true"/>
          </VButton>
          {{ movie.title }}
        </div>
      </VTabItem>
      <VTabItem>
        <div v-for="event in events">
          <VButton
              @click="addItemToPlace(event, 'events')"
              :rounded="true"
              :icon="true"
              :small="true"
              :disabled="isItemDisable(event)"
          >
            <VIcon :name="isItemDisable(event) ? 'check' : 'add'" :small="true"/>
          </VButton>
          {{ event.title }}
        </div>
      </VTabItem>
    </VTabsItems>

  </div>
</template>

<style scoped lang="scss">
.search {
  padding: 0 2rem 2rem 2rem;
}

.last-items {
  padding: 0 2rem 2rem 2rem;
}
</style>
