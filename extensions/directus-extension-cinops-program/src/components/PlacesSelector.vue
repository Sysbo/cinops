<script setup>
import {ref, defineEmits} from 'vue'
import {useApi} from '@directus/extensions-sdk'

const emit = defineEmits(['placeSelected'])
const api = useApi()
const places = ref([])
const placeSelected = ref(0)

function getPlaces() {
  api.get("/items/place").then((res) => {
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
  api.patch("/users/me", {
    "place_selected": placeSelected.value
  })
}

getPlaces()
setUserPlace()

</script>

<template>
  <select @change="$emit('placeSelected', placeSelected); updateSelectedPlace();" v-model="placeSelected" class="">
    <option v-for="place in places" :value="place.id" class="">
      {{ place.title }}
    </option>
  </select>
</template>

<style scoped lang="scss">

</style>
