<script setup>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listViewPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";
import {useApi} from "@directus/extensions-sdk";
import PlacesSelector from "./components/PlacesSelector.vue";
import MoviesPlace from "./components/MoviesPlace.vue";
import {onBeforeMount, ref} from "vue";

const api = useApi()
const livePreviewMode = ref(false)
const place = ref(1)
const addMovie = ref(false)
const calendarOptions = ref(
    {
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        listViewPlugin,
      ],
      initialView: "timeGridWeek",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "listWeek,dayGridMonth,timeGridWeek,timeGridDay",
      },
      locale: frLocale,
      selectable: true,
      nowIndicator: true,
      droppable: true,
      firstDay: 3,
      //weekNumbers: true,
      editable: true,
      slotDuration: "00:30:00",
      snapDuration: "00:05:00",
      height: "auto", //700,
      navLinks: true,
      eventColor: "rgb(200,200,200)",
      displayEventTime: true,
      slotMinTime: "08:00",
      slotMaxTime: "24:00",
      businessHours: {
        // days of week. an array of zero-based day of week integers (0=Sunday)
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Monday - Thursday
        startTime: "08:00", // a start time (10am in this example)
        endTime: "24:00", // an end time (6pm in this example)
      },
      events: (info, successCallback, failureCallback) => {
        setEvents(info, successCallback, failureCallback);
      },
      //eventReceive: this.handleEventReceive,
      //eventChange: this.handleEventChange,
    }
)

function setEvents(info, successCallback, failureCallback) {
  api
      .get(
          "/items/sessions?filter[place][_eq]=" +
          place.value +
          "&fields[]=*.*&filter[date][_between]=['" + info.start.toISOString().slice(0, 10) + "', '" + info.end.toISOString().slice(0, 10) + "']"
      )
      .then((res) => {
        successCallback(
            Array.prototype.slice
                .call(
                    // convert to array
                    res.data.data
                )
                .map(function (eventEl) {
                  return {
                    title: eventEl.movie.title,
                    start: eventEl.date + " " + eventEl.time,
                  };
                })
        );
      });
}

</script>

<template>
  <private-view :splitView="livePreviewMode" title="Programmation">
    <!--<template #title-outer:prepend> test </template>-->
    <template #navigation>
      <PlacesSelector @addMovie="addMovie=true"/>
      <MoviesPlace/>
    </template>
    <template #sidebar>
      <sidebar-detail icon="info" title="Information" close>
        <div class="page-description">
          Description de la page programmation
        </div>
      </sidebar-detail>
    </template>

    <v-drawer @cancel="addMovie=false" :modelValue="addMovie" :persistent="true"
              :title="'Ajouter un film au cinéma'">
      Test
    </v-drawer>
    <FullCalendar :options="calendarOptions"/>
  </private-view>
</template>

<style lang="scss" scoped>
</style>
