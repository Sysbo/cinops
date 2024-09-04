<script setup>
import {ref, defineEmits} from 'vue'
import {useApi} from '@directus/extensions-sdk'
import { useCinopsStore } from '../stores/cinops';


const cinopsStore = useCinopsStore()

const emit = defineEmits(['placeSelected'])
const api = useApi()
const places = ref([])
const placeSelected = ref(0)

function getPlaces() {
  api.get("/items/places?fields[]=id,name").then((res) => {
    places.value = res.data.data
  });
}
function setUserPlace() {
  api.get("/users/me").then((res) => {
    placeSelected.value = res.data.data.place_selected
  }).then(() => {
    emit('placeSelected', placeSelected.value)
  });
}

function updateSelectedPlace() {
  cinopsStore.selectedPlace = placeSelected.value
}

getPlaces()
setUserPlace()

</script>

<template>
  <select @change="updateSelectedPlace();" v-model="placeSelected" class="place-selector">
    <option v-for="place in places" :value="place.id" class="">
      {{ place.name }}
    </option>
  </select>
</template>

<style scoped lang="scss">
.place-selector {
  width: 100%;
  padding: 0.5rem;
  border: unset;
  margin-bottom: 0.3rem;
  font-weight: 700;
}
</style>
