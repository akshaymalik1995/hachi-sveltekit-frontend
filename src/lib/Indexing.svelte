<script>
  import { onMount, onDestroy } from "svelte";
  import { DOMAIN } from "$lib/stores.js";
  let current_statusEndpoint; // to store the current status endpoint to check indexing status, only atmax one such endpoint would be allowed for each client.
  let index_cancel_button;
  let index_start_button;

  onMount(() => {
    current_statusEndpoint = localStorage.getItem("stored_indexing_endpoint");
    if (current_statusEndpoint !== null) {
      let http_endpoint = "/getIndexStatus/" + current_statusEndpoint;
      index_cancel_button.disabled = false;
      index_start_button.disabled = true;

      pollEndpointNew(http_endpoint);
    }
  });

  onDestroy(() => {
    // apparently setinterval function would keep running in the background...even after destroy!!!
    if (pollEndpointTimeoutId) {
      clearTimeout(pollEndpointTimeoutId);
    }
  });

  $: if (current_statusEndpoint) {
    localStorage.setItem("stored_indexing_endpoint", current_statusEndpoint);
  }

  let input_element; // input element to accept indexing directory path..

  // current indexing stats
  let index_progress = 0.01;
  let directory_being_indexed = "";
  let extra_details = "";
  let eta = "";
  let index_directory_path = ""; // absolute path to directory to be indexed(input by user..)

  let pollEndpointTimeoutId;
  async function pollEndpointNew(endpoint, count = 0) {
    if (count == 0) {
      console.log("starting a new polll...");
    }

    let response = await fetch(DOMAIN + endpoint, { method: "GET" });
    let data = await response.json();

    let status_available = data["is_active"];

    if (status_available == true) {
      if (data["done"] == true) {
        let formData = new FormData();
        formData.append("ack", "true"); // let the server know that client has acknowledged that indexing done on server side. (So that server could do some cleanup,)

        let response = await fetch(DOMAIN + endpoint, {
          method: "POST",
          body: formData,
        });

        if (response.ok === false) {
          alert(
            "Some error on server side, after indexing is Completed. Contact administrator.."
          );
        } else {
          alert("Indexing Completed Successfully");
        }

        // update the indexing stats into localstorage
        let temp_stats = await fetch(DOMAIN + "/getMetaStats");
        temp_stats = await temp_stats.json();
        localStorage.setItem(
          "no_images_indexed",
          temp_stats["image"]["count"].toString()
        );
        localStorage.setItem(
          "unique_people_count",
          temp_stats["image"]["unique_people_count"].toString()
        );
        localStorage.setItem(
          "unique_place_count",
          temp_stats["image"]["unique_place_count"].toString()
        );

        index_start_button.disabled = false;

        //reset states.
        current_statusEndpoint = null; // to store the current status endpoint to check indexing status, only atmax one such endpoint would be allowed for each client.
        localStorage.removeItem("stored_indexing_endpoint");
        index_progress = 0;
        directory_being_indexed = "";
        eta = "";
        extra_details = "";
        index_directory_path = ""; // absolute path to directory to be indexed(input by user..)
        index_cancel_button.disabled = true;
        input_element.disabled = false;

        return;
      }

      index_progress = data["progress"];
      eta = data["eta"];
      extra_details = data["details"];
      directory_being_indexed = data["current_directory"];

      //set it to poll this endpoint .
      if (pollEndpointTimeoutId) {
        clearTimeout(pollEndpointTimeoutId);
      }
      pollEndpointTimeoutId = setTimeout(function () {
        pollEndpointNew(endpoint, count + 1);
      }, 1000); // call this function again, after a second.
    }
  }

  let complete_rescan = false; // bind to checkbox.
  async function startIndex() {
    if (index_start_button && index_directory_path) {
      index_start_button.disabled = true;
      input_element.disabled = true;
      let form_data = new FormData();

      form_data.append("image_directory_path", index_directory_path);
      form_data.append("complete_rescan", complete_rescan.toString());

      let url = "/indexStart";
      let response = await fetch(DOMAIN + url, {
        method: "POST",
        body: form_data,
      });
      let data = await response.json();
      let wasSuccess = data["success"]; // indexing started successfully.
      if (wasSuccess === true) {
        index_cancel_button.disabled = false;
        let endpoint = "/getIndexStatus/" + data.statusEndpoint;
        current_statusEndpoint = data.statusEndpoint; // for now assuming only one endpoint would be active for a CLIENT at a given time.
        pollEndpointNew(endpoint); // keep polling that endpoint.
      } else {
        alert(data["reason"]);
        index_start_button.disabled = false;
        input_element.disabled = false;
      }
    } else {
      console.log("No index_start_button object found!!!");
    }
  }

  async function cancelIndex() {
    if (current_statusEndpoint) {
      localStorage.removeItem("stored_indexing_endpoint");

      index_cancel_button.disabled = true;
      let url = "/indexCancel/" + current_statusEndpoint;
      let response = await fetch(DOMAIN + url, {
        method: "GET",
      });

      localStorage.removeItem("stored_indexing_endpoint");
      current_statusEndpoint = null;
      if (!response.ok) {
        alert("Error occured while cancelling index. Contact administrator.");
        throw new Error(response);
      }
      return;
    } else {
      return;
    }
  }
</script>

<div
  class="container mx-auto bg-gray-50 max-w-2xl my-10 p-6 shadow-lg rounded-lg"
>
  <div class="mb-4">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="block text-sm font-medium text-gray-700"
      >Directory to index</label
    >
    <input
      type="text"
      bind:this={input_element}
      bind:value={index_directory_path}
      on:keydown={(e) => {
        if (e.key === "Enter") {
          index_start_button.click();
        }
      }}
      class="mt-2 block border focus:outline-none p-2 text-black w-full focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm border-gray-300 rounded-md"
      placeholder="e.g., D://images"
      required
      aria-label="Directory to index"
    />
  </div>

    <div class="mb-5">
      <div class="h-3 rounded bg-gray-200 mb-2">
        <div
          class="h-full rounded bg-blue-500"
          style="width: {(index_progress * 100).toString()}%;"
        ></div>
      </div>
      <div class="text-sm text-blue-700 mb-1">
        Current directory: <span class="text-black"
          >{directory_being_indexed}</span
        > <span class="pl-3 text-right">ETA: </span>
        <span class="text-black">{eta}</span>
      </div>
      <div class="text-sm text-blue-700">
        Details: <span class="text-black">{extra_details}</span>
      </div>
    </div>

  <div class="mb-5 flex items-center">
    <input
      type="checkbox"
      bind:checked={complete_rescan}
      class="h-4 w-4 text-blue-600 border-gray-300 rounded"
    />
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="ml-2 text-sm text-gray-700">Complete Rescan</label>

    <p class="ml-4 text-xs text-gray-600 max-w-md">
      Re-index all originals, including already indexed and unchanged files.
    </p>
  </div>

  <div class="mb-6 flex items-center">
    <select
      class="block h-9 rounded border border-blue-500 px-2 py-1 text-sm text-blue-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    >
      <option>Images Only</option>
      <option disabled>Videos Only</option>
      <option disabled>Videos and Images</option>
    </select>
    <div class="ml-3 text-sm text-gray-700">Filter by content type</div>
  </div>

  <div class="flex justify-end">
    <button
      bind:this={index_cancel_button}
      on:click={cancelIndex}
      disabled
      type="button"
      class="mr-3 rounded bg-orange-400 hover:bg-orange-500 px-5 py-2 text-white transition disabled:bg-orange-200"
      >Cancel</button
    >
    <button
      bind:this={index_start_button}
      on:click={startIndex}
      type="button"
      class="rounded bg-blue-600 hover:bg-blue-700 px-5 py-2 text-white transition disabled:bg-blue-200"
      >Start</button
    >
  </div>
</div>
