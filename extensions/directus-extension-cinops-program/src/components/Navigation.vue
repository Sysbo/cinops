<script setup>
import {ref, defineEmits} from 'vue'
import {useApi} from '@directus/extensions-sdk'

const api = useApi()
const places = ref([])

const props = defineProps({
  current: Number
})

function getPlaces() {
  api.get("/items/places?fields[]=id,name").then((res) => {
    places.value = res.data.data
  });
}

getPlaces()

</script>

<template>
  <v-list nav v-if="places">
    <v-list-item v-for="place in places" :key="place.id" :active="place.id == current"
                 :to="'/cinops-program/' + place.id">
      <v-list-item-icon>
        <v-icon name="camera_outdoor" />
      </v-list-item-icon>
      <v-list-item-content>
        <v-text-overflow :text="place.name"/>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<style scoped lang="scss">

</style>
