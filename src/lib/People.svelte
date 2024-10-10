<script>
  import { DOMAIN } from "$lib/stores";
  import InfiniteScroll from "$lib/InfiniteScroll.svelte";
  export let people_list;
  console.log("PEOPLE LIST 2", people_list);

  function updatePersonId(event, id) {
    event.preventDefault()
    let new_person_id = document.querySelector("form#" + id)['person'].value
    let old_person_id = id
    
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
          alert("Success");
        }
      });
    }

  $: {
    imagesloadedcount = 20;
  }
  let imagesloadedcount = 20;
  function loadMoreImages() {
    imagesloadedcount += 20;
  }
</script>

<!-- Display each value in group as a clickable div, later on click we would use the PHOTOS component -->
<div
  class="grid grid-cols-5 justify-center items-center gap-2 mb-16 py-2 flex-wrap"
>
  <!-- A single div element -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <InfiniteScroll loadMoreFunction={loadMoreImages} threshold={100}>
    {#each people_list.slice(0, imagesloadedcount) as id}
      <!-- person => ['person_id', {}] -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#if id !== "no person detected"}
        <div
          class="flex flex-col justify-center items-center cursor-pointer"
          on:click={(e) => {
            console.log("Person id is", id);
          }}
        >
          <div>
            <a
              href={"/search?person=" + id}
              class="flex items-center w-48 h-48 rounded bg-gray-800"
            >
              <img
                loading="lazy"
                src={DOMAIN + "/getPreviewPerson/" + id}
                class="w-48 h-48 hover:rounded-none rounded w-full h-full bg-gray-100 border-gray-100 shadow-smr"
                alt=""
              />
            </a>
            <div
              class="flex text-black my-2 text-md text-white justify-center items-center"
              on:click={(e) => {
                if (
                  e.currentTarget.innerText ===
                  id.slice(0, 1).toUpperCase() + id.slice(1).toLowerCase()
                ) {
                  e.currentTarget.innerHTML = `<form id='${id}'><input name='person' class='bg-gray-800 text-white' type='text' value='${
                    id.slice(0, 1).toUpperCase() + id.slice(1).toLowerCase()
                  }' /></form>`;
                  document.querySelector("form#" + id).addEventListener("submit" , (event) => {
                    updatePersonId(event, id)
                  })
                }
              }}
              on:submit={(e) => {
                if (e.currentTarget.firstChild.tagName === "FORM") {
                  id = e.currentTarget.firstChild.value;
                  e.currentTarget.innerHTML =
                    id.slice(0, 1).toUpperCase() + id.slice(1).toLowerCase();
                }
              }}
            >
              {id.slice(0, 1).toUpperCase() + id.slice(1).toLowerCase()}
            </div>
          </div>
        </div>
      {/if}
    {/each}
  </InfiniteScroll>
</div>
