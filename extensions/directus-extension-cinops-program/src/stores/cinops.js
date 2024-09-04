import {defineStore} from 'pinia'
import {ref, watch} from "vue";
import {useApi} from "@directus/extensions-sdk";

export const useCinopsStore = defineStore('cinops', () => {
    const api = useApi()
    const selectedPlace = ref(0)
    const movies = ref(null)
    const events = ref(null)

    function getMovies() {
        api.get("/items/movies?filter[places][places_id][_eq]=" +
            selectedPlace.value).then((res) => {
            movies.value = res.data.data
        });
    }

    function getEvents() {
        api.get("/items/events?filter[places][places_id][_eq]=" +
            selectedPlace.value).then((res) => {
            events.value = res.data.data
        });
    }

    function setUserSelectedPlace() {
        api.patch("/users/me", {
            "place_selected": selectedPlace.value
        })
    }


    watch(selectedPlace, () => {
        getMovies()
        getEvents()
        setUserSelectedPlace()
    })

    return {selectedPlace, movies, events}
})