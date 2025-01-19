import {defineStore} from 'pinia'
import {ref, watch} from "vue";
import {useApi} from "@directus/extensions-sdk";

export const useCinopsStore = defineStore('cinops', () => {
    const api = useApi()
    const selectedPlace = ref(0)
    const place = ref(null);
    const cinemappAccessToken = ref(null)

    /*function getMovies() {
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
    }*/

        function getCinemappAccessToken() { 
            api.get("/items/cinemapp/?fields[]=cinemapp_access_token").then((res) => {
                cinemappAccessToken.value = res.data.data.cinemapp_access_token
            })
        }

    function setUserSelectedPlace() {
        api.patch("/users/me", {
            "place_selected": selectedPlace.value
        })
    }

    function getPlace() {
        api.get("/items/places/" + selectedPlace.value + "?fields[]=*.*,items.*,items.item.*").then((res) => {
            place.value = res.data.data
        });
    }

    function setDefaultPlaceId() {
        api.get("/items/places?fields[]=id").then((res) => {
            selectedPlace.value = res.data.data[0].id
        });
    }


    watch(selectedPlace, () => {
        getPlace()
        //setUserSelectedPlace()
    })
    setDefaultPlaceId()
    getCinemappAccessToken()

    return {selectedPlace, place, cinemappAccessToken, getPlace}
})