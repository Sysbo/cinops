<script setup>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listViewPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";
import {useApi} from "@directus/extensions-sdk";
import PlacesSelector from "./components/PlacesSelector.vue";
import PlaceItems from "./components/PlaceItems.vue";
import AddItemsToPlace from "./components/AddItemsToPlace.vue";
import {ref, watch} from "vue";

const api = useApi()
const livePreviewMode = ref(false)
const placeSelected = ref(0)
const movies = ref(null)
const events = ref(null)
const addMovie = ref(false)
const sessionId = ref(null)
const sessionDrawerActive = ref(false)
const fullcalendar = ref(null)
const calendarApi = ref(null)
const calendarOptions = ref(
    {
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        listViewPlugin
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
      weekNumbers: false,
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
      eventReceive: sessionReceive,
      eventChange: sessionChange
    }
)


watch(placeSelected, () => {
  if (typeof fullcalendar.value !== 'undefined' && fullcalendar.value !== null) {
    sessionRefetch()
  }
  getPlaceMovies()
  getPlaceEvents()
})


function getPlaceMovies() {
  api.get("/items/movie?filter[places][place_id][_eq]=" +
      placeSelected.value).then((res) => {
    movies.value = res.data.data
  });

}

function getPlaceEvents() {
  api.get("/items/event?filter[places][place_id][_eq]=" +
      placeSelected.value).then((res) => {
    events.value = res.data.data
  });
}

function sessionReceive(session) {
  api.post("/items/sessions/", {
    "movie": {"id": session.event.extendedProps.movie_id},
    "date": session.event.start.toISOString().slice(0, 10),
    "place": {"id": placeSelected.value},
    "time": session.event.start.getHours() + ":" + session.event.start.getMinutes() + ":" + session.event.start.getSeconds(),
    "room": {"id": 1}
  }).then(() => {
    session.event.remove()
  }).then(() => {
    sessionRefetch()
  })
}

function sessionEdit(session) {
  sessionDrawerActive.value = true
  sessionId.value = session.event.id
}

function addMinutesToDate(date, n) {
  const d = new Date(date);
  d.setTime(d.getTime() + n * 60_000);
  return d;
}

function setEvents(info, successCallback, failureCallback) {
  api
      .get(
          "/items/sessions?filter[place][_eq]=" +
          placeSelected.value +
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
                    id: eventEl.id,
                    end: eventEl.duration ? addMinutesToDate(eventEl.date + " " + eventEl.time, eventEl.duration) : addMinutesToDate(eventEl.date + " " + eventEl.time, eventEl.movie.runtime),
                    active: eventEl.active
                  };
                })
        );
      });
}

function diff_minutes(dateStart, dateEnd) {
  let dif = (dateEnd - dateStart);
  return Math.round((dif / 1000) / 60);
}

function sessionChange(session) {
  console.log(session)
  api.patch("/items/sessions/" + session.event.id, {
    "date": session.event.start.toISOString().slice(0, 10),
    "time": session.event.start.getHours() + ":" + session.event.start.getMinutes() + ":" + session.event.start.getSeconds(),
    "duration": diff_minutes(session.event.start, session.event.end)
  }).then(() => {
    sessionRefetch()
  })
}

function sessionUpdate(session) {
  api.patch("/items/sessions/" + session.id, session)
      .then(() => {
        sessionRefetch()
      })
}

function sessionVisibility(session) {
  api.patch("/items/sessions/" + session.event.id, {
    'active': !session.event.extendedProps.active
  })
      .then(() => {
        sessionRefetch()
      })
}

function sessionDelete(session) {
  console.log(session)
  api.delete("/items/sessions/" + session.event.id)
      .then(() => {
        sessionRefetch()
      })
}


function sessionRefetch() {
  let calendarApi = fullcalendar.value.getApi()
  calendarApi.refetchEvents()
}

</script>

<template>
  <private-view :splitView="livePreviewMode" title="Programmation">
    <!--<template #title-outer:prepend> test </template>-->
    <template #navigation>
      <PlacesSelector @place-selected="(p) => { placeSelected = p}"/>
      <v-button
          class="action-preview"
          @click="addMovie=true"
      >
        Ajouter un film
      </v-button>
      <PlaceItems v-if="placeSelected" :movies="movies" :events="events"/>
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
      <AddItemsToPlace @movieAddedToPlace="getPlaceMovies(); getPlaceEvents();" :place-selected="placeSelected"/>
    </v-drawer>

    <drawer-item v-if="sessionId" @input="sessionUpdate" @update:active="sessionDrawerActive=false"
                 collection="sessions"
                 :active="sessionDrawerActive" :primaryKey="sessionId"/>
    <FullCalendar ref="fullcalendar" v-if="placeSelected && PlaceItems" :options="calendarOptions">
      <template v-slot:eventContent='arg'>
        <template v-if="arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay'">
          <div><span v-if="arg.event.start">{{ arg.event.start.getHours() }}:{{ (arg.event.start.getMinutes() < 10 ? '0' : '') + arg.event.start.getMinutes() }}</span> <span v-if="arg.event.end"> - {{ arg.event.end.getHours() }}:{{ (arg.event.end.getMinutes() < 10 ? '0' : '') + arg.event.end.getMinutes() }}</span></div>
          <div><b @click="sessionEdit(arg)">{{ arg.event.title }}</b><br></div>
          <button @click="sessionVisibility(arg)">
            <v-icon v-if="arg.event.extendedProps.active" name="visibility"/>
            <v-icon v-else name="visibility_off"/>
          </button>
          <br>
          <button @click="sessionEdit(arg)">
            <v-icon name="edit"/>
          </button>
          <br>
          <button @click="sessionDelete(arg)">
            <v-icon name="delete_forever"/>
          </button>
        </template>
        <template v-else-if="arg.view.type === 'listWeek'">
          <button @click="sessionVisibility(arg)">
            <v-icon v-if="arg.event.extendedProps.active" name="visibility"/>
            <v-icon v-else name="visibility_off"/>
          </button>
          <button @click="sessionEdit(arg)">
            <v-icon name="edit"/>
          </button>
          <button @click="sessionDelete(arg)">
            <v-icon name="delete_forever"/>
          </button>
          <b>{{ arg.event.title }}</b>
        </template>
        <template v-else-if="arg.view.type === 'dayGridMonth'">
          <span v-if="arg.event.start">{{ arg.event.start.getHours() }}:{{ (arg.event.start.getMinutes() < 10 ? '0' : '') + arg.event.start.getMinutes() }}</span> <b @click="sessionEdit(arg)">{{ arg.event.title }}</b>
        </template>
        <template v-else>
          <b @click="sessionEdit(arg)">{{ arg.event.title }}</b>
        </template>
      </template>
    </FullCalendar>
  </private-view>
</template>

<style lang="scss" scoped>
</style>
