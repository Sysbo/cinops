<template>
  <div>
    <div class="mb-2 p-2">
      <button class="mt-1 w-full" :disabled="false" @click="addMovie()">
          Ajouter un film
        </button>
      <input
        id="name"
        v-model="searchValue"
        type="text"
        class="block w-full mt-1"
        placeholder="Rechercher un film"
      />
    </div>

    <div class="">
      <div v-for="e in filteredEvents" :key="e.id">
          {{ e.title }}
      </div>
        <!--<div
        v-for="e in filteredEvents" :key="e.id"
          :data-event="JSON.stringify(e.draggableEvent)"
          class="border-r-4 border-b last-of-type:border-b-0 p-1 pl-2 draggable-event flex"
          :class="
            e.pivot.status == 'publish'
              ? 'border-r-green-300 border-b-gray-100'
              : 'border-r-gray-300 border-gray-100'
          "
        >
          <div class="flex justify-center items-center mr-2">
            <div
            :style="{ backgroundColor: e.pivot.color }"
              class="
                h-full
                w-2
                rounded-full
                border-radius-round
              "
            ></div>
          </div>
          <div>
            <div
            class="font-bold"
              :class="
                e.pivot.status == 'publish' ? 'text-green-500' : 'text-gray-700'
              "
            >
              {{ e.local_title_fr }}
            </div>
            <span
              class="
                text-gray-500 text-xs
                font-semibold
                inline-flex
                items-center
                mr-2
                rounded
                
              "
            >
              <svg
                class="mr-1 w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {{ e.runtime }} min.
            </span>
            <span
              v-if="e.version"
              class="
                text-gray-500 text-xs
                font-semibold
                inline-flex
                items-center
                mr-2
                rounded
                
              "
            >
              <svg
                class="mr-1 w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                ></path>
              </svg>
              {{ e.version }}
            </span>
            <span
              class="
                text-gray-500 text-xs
                font-semibold
                inline-flex
                items-center
                mr-2
                rounded
                
              "
            >
              <svg
                class="mr-1 w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              {{ e.sessions_count }}
            </span>
          </div>
        </div>-->
    </div>
  </div>
</template>

<script>
import { Draggable } from "@fullcalendar/interaction";

export default {
  components: {
  },
  data() {
    return {
      searchValue: "",
    };
  },
  props: {
    events: Object,
  },
  methods: {
    setDraggableEvents() {
      var els = document.getElementsByClassName("draggable-event");
      for (var i = 0; i < els.length; i++) {
        new Draggable(els[i]);
      }
    },
    addMovie() {
      this.$emit("addMovie");
    },
  },
  mounted() {
    this.setDraggableEvents();
  },
  computed: {
    filteredEvents() {
      let tempEvents = Object.values(this.events);

      if (this.searchValue != "" && this.searchValue) {
        tempEvents = tempEvents.filter((item) => {
          return item.title
            .toUpperCase()
            .includes(this.searchValue.toUpperCase());
        });
      }
      return tempEvents;
    },
  },
  created() {
    
  }
};
</script>
