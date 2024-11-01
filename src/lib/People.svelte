<script>
  import { DOMAIN } from "$lib/stores";
  import InfiniteScroll from "$lib/InfiniteScroll.svelte";
  import { peopleListStore, peopleDataStore } from "$lib/stores";
  import Loading from "./Loading.svelte";
  console.log("PEOPLE LIST 2", $peopleListStore);

  console.log("PEOPLE LIST 3", $peopleDataStore);

  function sortPeopleList() {
    console.log("Inside sortPeopleList");
    let peopleList = $peopleListStore;
    let peopleData = $peopleDataStore;
    let sortedPeopleList = peopleList.sort((a, b) => {
      if (!peopleData[a] || !peopleData[b]) {
        return 0;
      }
      if (peopleData[a].numOfPhotos && peopleData[b].numOfPhotos){
        return peopleData[b].numOfPhotos - peopleData[a].numOfPhotos;
      }
      if (peopleData[a].numOfPhotos && !peopleData[b].numOfPhotos){
        return -1;
      }
      if (!peopleData[a].numOfPhotos && peopleData[b].numOfPhotos){
        return 1;
      }
    });
    return sortedPeopleList;
  }

  let loading = false

  function updatePersonId(event, id) {
    event.preventDefault();
    loading = true
    let new_person_id = document.querySelector("form#form-" + id)["person"].value;
    let old_person_id = id;

    let data = new FormData();
    data.append("new_person_id", new_person_id);
    data.append("old_person_id", old_person_id);

    fetch(DOMAIN + "/tagPerson", {
      method: "POST",
      body: data,
    }).then((response) => {
      if (!response.ok) {
        //  use a notification to display error/failure
        throw new Error("Error occured");
      } else {
        // use a notification to display success.
        $peopleListStore = $peopleListStore.map((item) => {
          if (item === old_person_id) {
            return new_person_id;
          }
          return item;
        });
        loading = false
        document.querySelector("#parent-" + id).innerText = new_person_id
        document.querySelector("form#form-" + id)["person"].blur()
        // alert("Success");
      }
    });
  }

  $: {
    imagesloadedcount = 100;
  }
  let imagesloadedcount = 100;
  function loadMoreImages() {
    imagesloadedcount += 40;
  }
</script>

{#if loading}
<Loading />
{/if}


<!-- Display each value in group as a clickable div, later on click we would use the PHOTOS component -->
<div
  class="flex justify-center items-center gap-5 mb-16 py-2 flex-wrap"
>
  <!-- A single div element -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <InfiniteScroll loadMoreFunction={loadMoreImages} threshold={100}>
    {#each sortPeopleList().slice(0, imagesloadedcount) as id}
      <!-- person => ['person_id', {}] -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#if id !== "no_person_detected" && id !== "no-categorical-info"}
        <div
          class="flex flex-col rounded-lg shadow-xl justify-center items-center cursor-pointer"
          on:click={(e) => {
            console.log("Person id is", id);
          }}
        >
          <div>
            <a
              href={"/search?person=" + id}
              class="flex rounded-lg items-center w-48 h-48 "
            >
              <img
                
                loading="lazy"
                src={DOMAIN + "/getPreviewPerson/" + id}
                class="w-48 h-48 rounded-lg bg-gray-100 shadow-sm"
                alt={id}
              />
              

            </a>
            <!-- <div
              id = {"parent-" + id}
              class="flex py-1 text-md text-white justify-center items-center"
              on:click={(e) => {
                if (
                  e.currentTarget.innerText ===
                  id.slice(0, 1).toUpperCase() + id.slice(1).toLowerCase()
                ) {
                  e.currentTarget.innerHTML = `<form id='form-${id}'><input name='person' class='bg-gray-800 p-1 text-white' type='text' value='${
                    id.slice(0, 1).toUpperCase() + id.slice(1).toLowerCase()
                  }' /></form>`;
                  document
                    .querySelector("form#form-" + id)
                    .addEventListener("submit", (event) => {
                      updatePersonId(event, id);
                    });
                }
              }}
              
              on:focusout={(e) => {
                if (e.currentTarget.firstChild.tagName === "FORM") {
                  id = e.currentTarget.firstChild.value;
                  e.currentTarget.innerHTML =
                    id.slice(0, 1).toUpperCase() + id.slice(1).toLowerCase();
                }
              }}
            >
              {id.slice(0, 1).toUpperCase() + id.slice(1).toLowerCase()}
            </div> -->
          </div>
        </div>
      {/if}
    {/each}
  </InfiniteScroll>
</div>
