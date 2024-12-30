<script setup>
import {ref} from 'vue'
import {useApi} from '@directus/extensions-sdk'
import Papa from 'papaparse'

const api = useApi()
const file = ref(null)
const maccsboxResults = ref([])


function importCSV() {
  maccsboxResults.value = []
  Papa.parse(file.value, {
    header: true,
    complete: function (results) {
      let csvData = results.data
      csvData.forEach(async (row) => {
        if (row["Titre"].length === 0 || row["Code externe"].length === 0) return
        let movie = {
          "title": row["Titre"],
          "visa": row["Code externe"],
          "release_date": row["Date de sortie"].split("/").reverse().join("-"),
          "runtime": row["Durée"],
          "directors": row["Réalisateur"],
          "distributor_id": {
            "name": row["Distributeur"]
          }
        }

        await api.get("/items/movies?filter[visa][_eq]=" +
            row["Code externe"] +
            "&fields[]=id,title").then((res) => {
          let exist = res.data.data.length > 0
          if (exist) {
            maccsboxResults.value.push({
              status: 'warning',
              title: movie.title,
              visa: movie.visa,
              icon: 'warning',
              message: 'Le film existe déjà'
            })
          } else {
            api.get("/items/distributors?filter[name][_eq]=" +
                row["Distributeur"] +
                "&fields[]=id,title").then((res) => {

              if(res.data.data[0].id) {
                movie.distributor_id.id = res.data.data[0].id
                console.log(movie.distributor_id)
              }
            }).then(() => {
              api.post("/items/movies/", movie).then((res) => {
                maccsboxResults.value.push({
                  status: 'success',
                  title: movie.title,
                  visa: movie.visa,
                  icon: 'check',
                  message: 'Film ajouté avec succès'
                })
              }).catch(function (error) {
                maccsboxResults.value.push({
                  status: 'error',
                  title: movie.title,
                  visa: movie.visa,
                  icon: 'block',
                  message: 'Erreur à l\'enregistrement du film'
                })
              });
            })
          }
        });
      })
    }
  })

}

function populateFile(event) {
  file.value = event.target.files[0];
}

</script>

<template>
  <div class="maccsbox">
    <div class="maccsbox__form">
      <h2>
        Sélectionnez un fichier CSV Maccsbox
      </h2>
      <div class="maccsbox__form__input">
        <Input
            v-model="file"
            type="file"
            @change="populateFile"
            accept="text/csv"
        />
      </div>
      <div class="maccsbox__action">
        <VButton @click="importCSV" small>
          Importer
        </VButton>
      </div>
    </div>
    <div class="maccsbox__results">
      <div v-if="maccsboxResults.length > 0">Total : {{ maccsboxResults.length }}</div>
      <div class="maccsbox__result" v-for="mbr in maccsboxResults">
        <VNotice :icon="mbr.icon" :type="mbr.status">
          <div>
            <div>
              <b>{{ mbr.message }}</b>
            </div>
            <div>
              {{ mbr.title }}
            </div>
            <div>
              {{ mbr.visa }}
            </div>
          </div>

        </VNotice>
      </div>
    </div>
  </div>

</template>

<style scoped lang="scss">
.maccsbox {
  padding: 0 2rem 2rem 2rem;
}

.maccsbox__results {
  margin-top: 1rem;
  display: flex;
  flex-flow: column;
  gap: 0.3rem;
}

.maccsbox__form__input {
  padding: 1rem;
  border: 2px solid gray;
  border-radius: 0.5rem;
}

.maccsbox__action {
  margin-top: 0.5rem;
}
</style>
