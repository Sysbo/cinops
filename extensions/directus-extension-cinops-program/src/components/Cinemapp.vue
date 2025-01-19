<script setup>
import {ref, watch} from 'vue'
import {useApi} from '@directus/extensions-sdk'
import {useCinopsStore} from '../stores/cinops'
import debounce from 'lodash.debounce'


const api = useApi()
const search = ref("")
const cinemappResults = ref([])
const loading = ref(false)
const cinopsStore = useCinopsStore()
const responseDialog = ref(false)
const cid = ref(null)
const movie = ref(null)
const movieExist = ref(false)
const result = ref(null)

watch(search, debounce(() => {
  cnemappSearch(search)
}, 500))

watch(cid, () => {
  cinemappMovie(cid)
})

watch(responseDialog, () => {
  movie.value = null
  result.value = null
})

watch(movie, () => {
  if(movie) {
    movieAlreadyExist()
  }
})

function cnemappSearch(search) {

  fetch('https://api.cinemapp.pro/public/movies/search?query=' + search.value, {
		method: 'GET',
		headers: {
			'x-access-token': cinopsStore.cinemappAccessToken,
		},
	})
		.then(response => response.json())
		.then(response => {
      cinemappResults.value = response.hits
    })
		.catch(err => console.error(err));
}

function cinemappMovie(cid) {
  movie.value = null;
  fetch('https://api.cinemapp.pro/public/movies/' + cid.value, {
		method: 'GET',
		headers: {
			'x-access-token': cinopsStore.cinemappAccessToken,
		},
	})
		.then(response => response.json())
		.then(response => {
      movie.value = response
    })
		.catch(err => console.error(err));
}

function computeDirectors(directors) {
  let dir = []
  directors.forEach(e => {
    dir.push(e.name)
  });

  return dir.join(", ")
}

function computeActors(actors) {
  let act = []
  actors.forEach(e => {
    act.push(e.name)
  });

  return act.join(", ")
}

async function importMovie() {

  if(!movie.value){
    result.value = {
                  status: 'error',
                  title: '',
                  icon: 'block',
                  message: 'Erreur à l\'enregistrement du film'
                }
    return 
  } 

  let cinemappMovie = {
          "title": movie.value.localTitle.fr ? movie.value.localTitle.fr : movie.originalTitle,
          "cid": movie.value.cid,
          "release_date": movie.value.releaseDate.be_fr ? movie.value.releaseDate.be_fr.split("/").reverse().join("-") : null,
          "release_year": movie.value.releaseYear ? movie.value.releaseYear : null, 
          "runtime": movie.value.runtime? movie.value.runtime : 0,
          "directors": computeDirectors(movie.value.directors),
          "cast" : computeActors(movie.value.actors),
          "genres":movie.value.genres ? movie.value.genres.join(', ') : null,
          "distributor_id": {
            "name": movie.value.distributor ? movie.value.distributor.name : null
          }
        }

            let distributor =  movie.value.distributor ? movie.value.distributor.name : "undefined"
            api.get("/items/distributors?filter[name][_eq]=" +
            distributor +
                "&fields[]=id,title").then((res) => {
              if (res.data.data.length > 0 && res.data.data[0].id) {
                cinemappMovie.distributor_id.id = res.data.data[0].id
              }
            }).then(() => {
              api.post("/items/movies/", cinemappMovie).then((mv) => {
                if(movie.value.media.hasOwnProperty('poster') && movie.value.media.poster.hasOwnProperty('fr')) {
                  let posterMovie = null;
                  for (const [key, val] of Object.entries(movie.value.media.poster.fr)) {
                    if(val.name == 'normal') {
                      posterMovie = {
                        "url": val.url,
                        "data" : {
                          "folder": '4e0bbd3a-3faf-46a3-aedd-52114420e623'
                        }
                      }
                    }
                  }

                  if(posterMovie) {
                    api.post("/files/import/", posterMovie).then((media) => {       
                      
                      addPosterToMovie(media.data.data.id, mv.data.data.id)

                      result.value = {
                        status: 'success',
                        title: '',
                        icon: 'check',
                        message: 'Film ajouté avec succès'
                      }
                      }).catch(function (error) {
                        result.value = {
                          status: 'error',
                          title: '',
                          icon: 'block',
                          message: 'Erreur à l\'enregistrement du film'
                        }
                      });
                  }
                }
                result.value = {
                  status: 'success',
                  title: '',
                  icon: 'check',
                  message: 'Film ajouté avec succès'
                }
              }).catch(function (error) {
                result.value = {
                  status: 'error',
                  title: '',
                  icon: 'block',
                  message: 'Erreur à l\'enregistrement du film'
                }
              });
            })
}

function addPosterToMovie(mediaId, itemId) {
  api.patch("/items/movies/"+ itemId, {
            "poster": mediaId
        })
}

async function movieAlreadyExist() {
  await api.get("/items/movies?filter[cid][_eq]=" +
            movie.value.cid +
            "&fields[]=id,title").then((res) => {
          movieExist.value = res.data.data.length > 0
            })
}

</script>

<template>
  <div class="cinemapp">
    <div class="cinemapp__form">
      <h2>
        Chercher un film Cinemapp
      </h2>
      <div class="cinemapp__form__input">
        <VInput v-model="search" />
      </div>
    </div>
    <div class="cinemapp__results">
      <div class="cinemapp__result" @click="() => {cid = result.cid; responseDialog = true}" v-for="result in cinemappResults">
        {{ result.title }} <strong>({{ result.cid }})</strong>
      </div>
    </div>
  </div>

  <v-dialog v-model="responseDialog" @esc="() => {responseDialog = false;}">
	<v-sheet class="cinemapp__dialog__content">
    <v-notice type="warning" icon="warning" v-if="movieExist">Le fim existe déjà</v-notice>
		<v-notice type="success" icon="done" v-if="result && result.status == 'success' ">Importé avec succès</v-notice>
		<v-notice type="danger" icon="error" v-if="result && result.status == 'error'">Erreur à l'enregsitrement</v-notice>
    <v-button v-if="!movieExist" :fullWidth="true" @click="importMovie">Importer le film</v-button>
    <template v-if="movie.hasOwnProperty('media') && movie.media.hasOwnProperty('poster') && movie.media.poster.hasOwnProperty('fr')" v-for="img in movie.media.poster.fr">
      <img v-if="img.name == 'normal'" :src="img.url" style="width: 100%; max-width: 250px; height: auto;">
    </template>
   
    <div><strong>CID :</strong> <span v-if="movie.cid">{{ movie.cid }}</span></div>
    <div><strong>Titre Français :</strong> <span v-if="movie.localTitle.fr">{{ movie.localTitle.fr }}</span></div>
    <div><strong>Année de sortie :</strong> <span v-if="movie.releaseYear">{{ movie.releaseYear }}</span></div>
    <div><strong>Date de sortie BE-FR :</strong> <span v-if="movie.releaseDate.be_fr">{{ movie.releaseDate.be_fr }}</span></div>
    <div><strong>Genres :</strong> <span v-if="movie.genres">{{ movie.genres.join(', ') }}</span></div>
    <div><strong>Distributeur :</strong> <span v-if="movie.distributor.name">{{ movie.distributor.name }}</span></div>
    <div><strong>Durée :</strong> <span v-if="movie.runtime">{{ movie.runtime }}</span></div>
    <div><strong>Synopsis long :</strong> <span v-if="movie.synopsis.hasOwnProperty('fr') && movie.synopsis.fr.hasOwnProperty('full')">{{ movie.synopsis.fr.full }}</span></div>
    <div><strong>Acteurs:</strong> {{ computeActors(movie.actors) }}</div>
    <div><strong>Réalisateurs :</strong> {{ computeDirectors(movie.directors) }}</div>
		<v-button :fullWidth="true" :secondary="true" :small="true" @click="responseDialog = false">Fermer</v-button>
	</v-sheet>
</v-dialog>

</template>

<style scoped lang="scss">
.cinemapp {
  padding: 0 2rem 2rem 2rem;
}

.cinemapp__results {
  margin-top: 1rem;
  display: flex;
  flex-flow: column;
  gap: 0.3rem;
}

.cinemapp__result {
  background-color: var(--theme--background-normal);
  padding: 0.5rem;
  border-radius: 0.3rem;
  cursor: pointer;
}

.cinemapp__result:hover {
  background-color: var(--theme--background-accent);
}

.cinemapp__dialog__content {
  --v-sheet-height: 90vh;
}
</style>
