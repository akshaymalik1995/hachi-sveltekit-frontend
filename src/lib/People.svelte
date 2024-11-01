<script>
  import { DOMAIN } from "$lib/stores";
  import InfiniteScroll from "$lib/InfiniteScroll.svelte";
  import { peopleListStore, peopleDataStore, imagesDataStore } from "$lib/stores";
  import Loading from "./Loading.svelte";
  import {
    Modal,
    Tooltip,
    Input,
    Label,
    Checkbox,
    Button,
    Spinner,
  } from "flowbite-svelte";
  console.log("PEOPLE LIST 2", $peopleListStore);

  console.log("PEOPLE LIST 3", $peopleDataStore);

  let labelledPeople = $peopleListStore.filter((item) => {
    return item !== "no_person_detected" && item !== "no-categorical-info" && !item.startsWith("cluster");
  });

  let unlabelledPeople = $peopleListStore.filter((item) => {
    return item.startsWith("cluster");
  });

  $ : {
    labelledPeople = $peopleListStore.filter((item) => {
    return item !== "no_person_detected" && item !== "no-categorical-info" && !item.startsWith("cluster");
  });

    unlabelledPeople = $peopleListStore.filter((item) => {
    return item.startsWith("cluster");
  });

    sortedPeopleList = sortPeopleList();

  }

  function sortPeopleList() {
    console.log("Inside sortPeopleList");
    let peopleList = $peopleListStore;
    let peopleData = $peopleDataStore;
    let sortedPeopleList = unlabelledPeople.sort((a, b) => {
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

  let sortedPeopleList = sortPeopleList();

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

  function handleFormSubmit(event) {
    console.log("Form submitted");
    let newPersonId = document.querySelector("input[name='name']").value;
    console.log("New person id is", newPersonId);
    console.log("Old person id is", personSelected);
    event.preventDefault();
    if (!newPersonId) return;
    if (!personSelected) return;

    let old_person_id = personSelected;
    let new_person_id = newPersonId;




    let data = new FormData();
    
    data.append("new_person_id", new_person_id);
    data.append("old_person_id", old_person_id);
    loading = true;
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
        labelledPeople = 
        $peopleDataStore[new_person_id] = $peopleDataStore[old_person_id];
        loading = false;
        formModal = false;

        alert("Success");
      }
    });
  }

  let formModal = false;

  let personSelected = "";

  let newPersonId = "";


</script>


<Modal dialogClass='fixed inset-0 h-modal md:inset-0 md:h-full z-50 w-full p-4 flex' title="Label" placement="center" bind:open={formModal} size="xs" autoclose={false} class="w-full z-30 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  <form
    on:submit={handleFormSubmit}
    id="imageForm"
    class="flex flex-col space-y-6"
    action="#"
  >
    <Label class="space-y-2">
      <span>Name</span>
      <Input
        value={newPersonId}
        type="name"
        name="name"
        placeholder="Akshay..."
        autocomplete
        required
        class="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
      />
    </Label>

    <button
      type="submit"
      class="text-white text-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
    >
      {#if loading}
        <!-- <Spinner color="white" size="4" /> -->
        Saving...
      {:else}
        Save
      {/if}
    </button>
    <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
      <a
        href={"/search?person=" + personSelected}
        class="text-primary-700 hover:underline dark:text-primary-500"
      >
        See all pictures
      </a>
    </div>
  </form>
</Modal>

<div
  class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-16"
>
    {#each labelledPeople as id}
      <!-- person => ['person_id', {}] -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <a
        href={"/search?person=" + id}
          class="flex flex-col py-4 rounded-lg border justify-center items-center cursor-pointer"
        >
          <div>
            <!-- <a
              href={"/search?person=" + id}
              class="flex rounded-lg items-center w-48 h-48 "
            >
              <img
                
                loading="lazy"
                src={DOMAIN + "/getPreviewPerson/" + id}
                class="w-48 h-48 rounded-lg bg-gray-100 shadow-sm"
                alt={id}
              />
              

            </a> -->
          
           
            <div class="dark:text-white">{id}</div>
     
            
          </div>
        </a>

    {/each}
</div>


<!-- Display each value in group as a clickable div, later on click we would use the PHOTOS component -->
<div
  class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-16 py-2"
>
  <!-- A single div element -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <InfiniteScroll loadMoreFunction={loadMoreImages} threshold={100}>
    {#each sortedPeopleList.slice(0, imagesloadedcount) as id}
      <!-- person => ['person_id', {}] -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#if id !== "no_person_detected" && id !== "no-categorical-info"}
        <div
          class="flex flex-col rounded-lg shadow-xl justify-center items-center cursor-pointer"
          on:click={() => {
            personSelected = id;
            formModal = true;
          }}
        >
          <div>
            <!-- <a
              href={"/search?person=" + id}
              class="flex rounded-lg items-center w-48 h-48 "
            >
              <img
                
                loading="lazy"
                src={DOMAIN + "/getPreviewPerson/" + id}
                class="w-48 h-48 rounded-lg bg-gray-100 shadow-sm"
                alt={id}
              />
              

            </a> -->
            <div
              class="flex rounded-lg items-center w-48 h-48 "
            >
              <img
                
                loading="lazy"
                src={DOMAIN + "/getPreviewPerson/" + id}
                class="w-48 h-48 rounded-lg bg-gray-100 shadow-sm"
                alt={id}
              />
              

          </div>
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
