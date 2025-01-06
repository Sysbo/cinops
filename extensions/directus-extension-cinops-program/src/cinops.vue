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
import {ref, watch, watchEffect} from "vue";
import {useCinopsStore} from './stores/cinops';
import {storeToRefs} from 'pinia'
import isDarkColor from 'is-dark-color'
import Navigation from './components/Navigation.vue'
import ImportMaccsbox from "./components/ImportMaccsbox.vue";

const cinopsStore = useCinopsStore()
const {place} = storeToRefs(cinopsStore)

const api = useApi()
const livePreviewMode = ref(false)
const addMovie = ref(false)
const importMovies = ref(false)
const sessionId = ref(null)
const sessionDrawerActive = ref(false)
const fullcalendar = ref(null)
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

// Get Cinema ID from URL
const props = defineProps({
  theater: {
    type: Number,
    default: null
  }
})

// Watch Theater ID change from URL and change selectedPlace in Cinops store
watchEffect(() => {
  if (props.theater) {
    cinopsStore.selectedPlace = props.theater
  }
})

watch(place, () => {
  if (typeof fullcalendar.value !== 'undefined' && fullcalendar.value !== null) {
    sessionRefetch()
  }
})

function sessionReceive(session) {
  api.post("/items/sessions/", {
    //"movie_id": {"id": session.event.extendedProps.movie_id},
    "date": session.event.start.toISOString().slice(0, 10),
    "place_id": {"id": place.value.id},
    "time": session.event.start.getHours() + ":" + session.event.start.getMinutes() + ":" + session.event.start.getSeconds(),
    "items": {
      "create": [{
        "item": session.event.extendedProps.element_id,
        "collection": session.event.extendedProps.type
      }]
    }
    //"room_id": {"id": 1}
  }).then(() => {
    session.event.remove()
  }).then(() => {
    cinopsStore.getPlace()
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

function findSessionColor(session) {
  if(session.items.length === 0) return "#efefef"
  const item = cinopsStore.place.items.find((e) => e.item.id === session.items[0].item.id)
  if (typeof item !== "undefined" && item.color != null) {
    return item.color
  } else {
    return "#efefef"
  }
}

function setEvents(info, successCallback, failureCallback) {
  api
      .get(
          "/items/sessions?filter[place_id][_eq]=" +
          place.value.id +
          "&fields[]=*.*,items.*,items.item.*&filter[date][_between]=" + info.start.toISOString().slice(0, 10) + "," + info.end.toISOString().slice(0, 10)
      )
      .then((res) => {
        successCallback(
            Array.prototype.slice
                .call(
                    // convert to array
                    res.data.data
                )
                .map(function (eventEl) {
                  const color = findSessionColor(eventEl)
                  return {
                    display: "block",
                    title: eventEl.items[0] ? eventEl.items[0].item.title : null,
                    backgroundColor: (eventEl.active) ? color : "#efefef",
                    borderColor: color,
                    textColor: isDarkColor(color) && eventEl.active ? "#FFFFFF" : "#000000",
                    start: eventEl.date + " " + eventEl.time,
                    id: eventEl.id,
                    type: eventEl.items[0] ? eventEl.items[0].collection : null,
                    end: eventEl.duration ? addMinutesToDate(eventEl.date + " " + eventEl.time, eventEl.duration) : addMinutesToDate(eventEl.date + " " + eventEl.time, eventEl.items[0] ? eventEl.items[0].item.runtime : null),
                    active: eventEl.active,
                    premiere: eventEl.premiere,
                    last: eventEl.last,
                    single: eventEl.single,
                    description: eventEl.description,
                    version: eventEl.items[0] ? eventEl.items[0].item.version : null
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
  if (confirm("Valider la suppression de la séance ?") === false) {
    return
  }
  api.delete("/items/sessions/" + session.event.id)
      .then(() => {
        sessionRefetch()
      })
}


function sessionRefetch() {
  const calendarApi = fullcalendar.value.getApi()
  calendarApi.refetchEvents()
}

</script>

<template>
  <private-view :splitView="livePreviewMode" v-if="place" :title="place.name">
    <template #title-outer:prepend>
      <v-button class="header-icon" rounded disabled icon secondary>
        <v-icon name="calendar_month"/>
      </v-button>
    </template>
    <template #headline>
      Programmation
    </template>
    <template #actions>
      <v-button @click="addMovie=true" v-tooltip.bottom="'Ajouter un élément au cinéma'" icon rounded>
        <v-icon name="add"/>
      </v-button>
    </template>
    <template #navigation>
      {{ cinema }}
      <Navigation :current="cinopsStore.selectedPlace"/>
    </template>
    <template #sidebar>
      <sidebar-detail icon="info" title="Information" close>
        <div class="page-description">
          Programmation du cinéma : {{ place.name }}
        </div>
      </sidebar-detail>
      <sidebar-detail icon="upload" title="Import Maccsbox" open>
        <div class="page-description">
          <VButton @click="importMovies=true" small>
            Importer films Maccsbox
          </VButton>
        </div>
      </sidebar-detail>
    </template>

    <v-drawer @cancel="addMovie=false" :modelValue="addMovie" :persistent="true"
              :title="'Ajouter un élément au cinéma'">
      <AddItemsToPlace/>
    </v-drawer>

    <v-drawer @cancel="importMovies=false" :modelValue="importMovies" :persistent="true"
              :title="'Importer des films Maccsbox'">
      <ImportMaccsbox/>
    </v-drawer>

    <drawer-item v-if="sessionId" @input="sessionUpdate" @update:active="sessionDrawerActive=false"
                 collection="sessions"
                 :active="sessionDrawerActive" :primaryKey="sessionId"/>


    <div class="prog">
      <div class="prog__left">
        <!--<v-button
              class="action-preview"
              @click="addMovie=true"
              :xSmall="true"
              :tile="true"
              :fullWidth="true"
          >
            Ajouter un élément
          </v-button>-->
        <PlaceItems v-if="place"/>
      </div>
      <div class="prog__right">
        <FullCalendar ref="fullcalendar" :options="calendarOptions">
          <template v-slot:eventContent='arg'>
            <template v-if="arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay'">
              <div class="fc-event-main__content">
                <div class="fc-event-main__time">
                <span v-if="arg.event.start">{{
                    arg.event.start.getHours()
                  }}:{{ (arg.event.start.getMinutes() < 10 ? '0' : '') + arg.event.start.getMinutes() }}
                </span>
                  <span
                      v-if="arg.event.end"> - {{
                      arg.event.end.getHours()
                    }}:{{ (arg.event.end.getMinutes() < 10 ? '0' : '') + arg.event.end.getMinutes() }}
                </span>
                </div>
                <div @click="sessionEdit(arg)" class="fc-event-main__title">
                  <div class="fc-event-main__version">{{ arg.event.extendedProps.version }}</div>
                  {{ arg.event.title }}
                </div>
              </div>

              <div class="fc-event-main__actions">
                <v-icon @click="sessionVisibility(arg)" small="true" color="black"
                        :name="arg.event.extendedProps.active ? 'visibility' : 'visibility_off'"
                        class="fc-event-main__visibility"/>
                <v-icon @click="sessionEdit(arg)" small="true" name="edit" color="black"/>
                <v-icon @click="sessionDelete(arg)" small="true" name="delete_forever" color="black"/>
              </div>

              <div class="fc-event-main__status"
                   v-if="arg.event.extendedProps.premiere || arg.event.extendedProps.last || arg.event.extendedProps.single">
                <v-icon v-if="arg.event.extendedProps.premiere" xSmall color="orange" class="event-premiere"
                        name="star"/>
                <v-icon v-if="arg.event.extendedProps.last" xSmall color="red" class="event-last" name="warning"/>
                <span v-if="arg.event.extendedProps.single" class="event-single">SU</span>
              </div>
            </template>
            <template v-else-if="arg.view.type === 'listWeek'">
              <div class="listweek__details">
                <v-icon @click="sessionVisibility(arg)" clickable
                        :name="arg.event.extendedProps.active ? 'visibility' : 'visibility_off'"
                        :color="arg.event.extendedProps.active ? '#84cc16' : 'inherit' "/>
                <div class="listweek__title__wrapper">
                  <b class="listweek__title">
                    <v-icon class="event-type"
                            :name="arg.event.extendedProps.type == 'movies' ? 'theaters' : 'campaign'"/>
                    <span class="listweek__version" v-if="arg.event.extendedProps.version">{{ arg.event.extendedProps.version }} • &nbsp</span> {{ arg.event.title }}
                    <div class="listweek__status">
                      <v-icon v-if="arg.event.extendedProps.premiere" color="orange" class="event-premiere"
                              name="star"/>
                      <v-icon v-if="arg.event.extendedProps.last" color="red" class="event-last" name="warning"/>
                      <span v-if="arg.event.extendedProps.single" class="event-single">Séance unique</span>
                    </div>
                  </b>

                  <div class="listweek__description">
                    {{ arg.event.extendedProps.description }}
                  </div>
                </div>
                <div class="listweek__actions">
                  <v-icon @click="sessionEdit(arg)" name="edit" clickable/>
                  <v-icon @click="sessionDelete(arg)" name="delete_forever" clickable/>
                </div>
              </div>
            </template>
            <template v-else-if="arg.view.type === 'dayGridMonth'">
          <span v-if="arg.event.start">{{
              arg.event.start.getHours()
            }}:{{ (arg.event.start.getMinutes() < 10 ? '0' : '') + arg.event.start.getMinutes() }}</span> <b
                @click="sessionEdit(arg)">{{ arg.event.title }}</b>
            </template>
            <template v-else>
              <b @click="sessionEdit(arg)">{{ arg.event.title }}</b>
            </template>
          </template>
        </FullCalendar>
      </div>
    </div>

  </private-view>
</template>

<style lang="scss" scoped>

.listweek__details {
  display: flex;
  line-height: normal;
}

.listweek__actions {
  margin-left: auto;
  flex: 0 0 auto;
}

.listweek__description {
  font-size: 0.9rem;
}

.listweek__title__wrapper {
  padding-left: 1rem;
}

.listweek__title {
  display: flex;
  align-items: center;
}

.listweek__version {
  color: gray;
}

.listweek__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1rem;
  font-size: 0.9rem;
}

.listweek__status .event-single {
  color: red;
}

.resize-wrapper {
  display: none !important;
}

.prog {
  display: flex;
  //flex-flow: row wrap;
}

.prog * {
  box-sizing: border-box;
}

.prog__left {
  margin: 0 1rem;
  width: 15rem;
  min-width: 15rem;
  display: flex;
  flex-flow: column;
}

.prog__right {
  //flex: 1 1 100%;
  width: 100%;
}

</style>

<style>

.fc-dayGridMonth-view .fc-event-main {
  overflow: hidden;
}

.fc-event-main__content {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.fc-event .fc-event-main:hover .fc-event-main__actions {
  display: block;
}

.fc-event-main__time {
  font-size: 0.8rem;
  line-height: normal;
}

.fc-event-main__title {
  font-size: 0.9rem;
  line-height: normal;
}

.fc-event-main__actions {
  display: none;
  background-color: rgba(255, 255, 255, 1);
  position: absolute;
  top: 0;
  left: 0;
}

.fc-v-event {
  border-width: 2px;
}

.fc-event-main__status {
  background-color: rgba(255, 255, 255, 1);
  position: absolute;
  bottom: -1rem;
  left: 0;
  border-radius: 0.4rem;
  font-size: 0.7rem;
  padding: 0.2rem;
  color: var(--black);
  border: 1px solid var(--fc-border-color);
  line-height: normal;
}

.fc-event-main__status .event-single {
  color: red;
}
</style>
