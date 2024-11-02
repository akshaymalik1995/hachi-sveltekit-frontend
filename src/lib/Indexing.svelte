<script>
  import { onMount, onDestroy } from "svelte";
  import { DOMAIN } from "./stores";
  
  let current_statusEndpoint;
  let index_cancel_button;
  let index_start_button;  
  
  onMount(() => {
    current_statusEndpoint = localStorage.getItem("stored_indexing_endpoint");
    if (current_statusEndpoint !== null) {
      let http_endpoint = DOMAIN + "/getIndexStatus/" + current_statusEndpoint;
      index_cancel_button.disabled = false;
      index_start_button.disabled = true;
      pollEndpointNew(http_endpoint);
    }
  });
  
  onDestroy(() => {
    if (pollEndpointTimeoutId) {
      clearTimeout(pollEndpointTimeoutId);
    }
  });
  
  $: if (current_statusEndpoint) {
    localStorage.setItem("stored_indexing_endpoint", current_statusEndpoint);
  }
  
  let input_element;
  let select_input_element;
  
  let index_progress = 0.00;                 
  let directory_being_indexed = "";
  let extra_details = "";
  let eta = "";
  let index_directory_path = "";
  
  let pollEndpointTimeoutId;
  async function pollEndpointNew(endpoint, count = 0) {
    if (count == 0) {
      console.log("starting a new poll...");
    }
    
    let response = await fetch(endpoint, { method: "GET" });
    let data = await response.json();
  
    let status_available = data["is_active"];
  
    if (status_available == true) {
      if (data["done"] == true) {
        let final_status = data["details"];
        let formData = new FormData();
        formData.append("ack", "true");
  
        let response = await fetch(endpoint, {
          method: "POST",
          body: formData
        });
        
        if (response.ok === false) {
          alert("Some error on server side, after indexing is Completed. Contact administrator..");    
        } else {
          alert("Indexing Completed.\nFinal Status: " + final_status);
        }
        
        let temp_stats = await fetch(DOMAIN + "/getMetaStats");
        temp_stats = await temp_stats.json();
  
        index_start_button.disabled = false;
  
        current_statusEndpoint = null;
        localStorage.removeItem("stored_indexing_endpoint");
        index_progress = 0;
        directory_being_indexed = "";
        eta = "";
        extra_details = "";
        index_directory_path = "";
        index_cancel_button.disabled = true;
        index_cancel_button.innerText = "Cancel";
        input_element.disabled = false;
        if (select_input_element) {
          select_input_element.value = "None selected";
        }
  
        return;
      }
  
      index_progress = data["progress"];
      eta = data["eta"];
      extra_details = data["details"];
      directory_being_indexed = data["current_directory"];
      
      if (pollEndpointTimeoutId) {
        clearTimeout(pollEndpointTimeoutId);
      }
      pollEndpointTimeoutId = setTimeout(function() { pollEndpointNew(endpoint, count + 1) }, 1000);
    }
  }
  
  let complete_rescan = false;
  async function startIndex() {
    if (index_start_button && index_directory_path) {
      index_start_button.disabled = true;
      input_element.disabled = true;
  
      let form_data = new FormData();
      form_data.append("image_directory_path", index_directory_path);
      form_data.append("complete_rescan", complete_rescan.toString());
  
      let url = DOMAIN + "/indexStart";
      let response = await fetch(url, { method: 'POST', body: form_data });
      let data = await response.json();
      let wasSuccess = data["success"];
      if (wasSuccess === true) {
        index_cancel_button.disabled = false;
        let endpoint = DOMAIN + "/getIndexStatus/" + data.statusEndpoint;
        current_statusEndpoint = data.statusEndpoint;
        pollEndpointNew(endpoint);
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
      index_cancel_button.disabled = true;
      index_cancel_button.innerText = "Cancelling... Please wait.";
      let url = DOMAIN + "/indexCancel/" + current_statusEndpoint;
      let response = await fetch(url, { method: "GET" });
      
      localStorage.removeItem("stored_indexing_endpoint");
      current_statusEndpoint = null;
      if (!response.ok) {
        alert("Error occurred while cancelling index. Contact administrator.");
        throw new Error(response);
      }
      return;
    } else {
      return;
    }
  }
</script>

<div class="container mx-auto max-w-lg bg-gray-50 dark:bg-gray-800 rounded shadow-md p-4">
  <p class="mb-2 text-sm font-semibold dark:text-gray-200">Press Start button to start indexing</p>
  
  <div class="my-4">
    <input bind:this={input_element} bind:value={index_directory_path} on:keydown={(e) => { if (e.key === "Enter") { index_start_button.click(); } }} type="text" class="w-full rounded border p-1 text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-gray-200" placeholder="D://images (Full path to directory to index)" required={true} />
    
    <p class="mt-4 font-semibold dark:text-gray-200">OR</p>

    <div class="mt-4 flex flex-wrap items-center">
      <select bind:this={select_input_element} class="h-8 rounded border border-blue-500 p-1 text-sm text-blue-700 dark:border-blue-300 dark:text-blue-300 focus:outline-none" on:change={(e) => { if (e.target.value == "None selected") { index_directory_path = ""; input_element.disabled = false; } else { index_directory_path = e.target.value; input_element.disabled = true; } }}>
        <option>None selected</option>
        <option value="google_photos">Google Photos</option>
      </select>
      
      <div class="ml-2 text-sm text-gray-600 dark:text-gray-400">Choose a supported remote protocol</div>
    </div>
  </div>
  
  <div class="my-4">
    <div class="flex items-center">
      <div class="flex h-2 w-11/12 rounded bg-gray-300 dark:bg-gray-700">
        <div class="h-2 rounded bg-blue-500" style="width: {(index_progress * 100).toString()}%;"></div>
      </div>
      <div class="flex px-2 font-semibold dark:text-gray-200">{(index_progress * 100).toString().slice(0, 4)}%</div>
    </div>
    
    <div class="pt-1 text-sm text-blue-600 dark:text-blue-300">Current directory: <span class="text-black dark:text-gray-200">{directory_being_indexed}</span> <span class="pl-3 text-right">ETA: </span> <span class="text-black dark:text-gray-200">{eta}</span></div>
    <div class="pt-1 text-sm text-blue-600 dark:text-blue-300">Details: <span class="text-black dark:text-gray-200">{extra_details}</span></div>
  </div>
  
  <div class="my-4 flex flex-wrap items-center">
    <div class="mr-2 flex items-center">
      <input type="checkbox" bind:checked={complete_rescan} class="h-5 w-5 text-blue-500 dark:text-blue-300" />
      <label class="ml-1 dark:text-gray-200">Complete Rescan</label>
    </div>
    <div class="text-sm text-gray-600 dark:text-gray-400">Re-index all originals, including already indexed and unchanged files.</div>
  </div>
  
  <div class="my-4 flex flex-wrap items-center">
    <select class="h-8 rounded border border-blue-500 p-1 text-sm text-blue-700 dark:border-blue-300 dark:text-blue-300 focus:outline-none">
      <option>Images Only</option>
      <option disabled>Videos Only</option>
      <option disabled>Videos and Images</option>
    </select>
    
    <div class="ml-2 text-sm text-gray-600 dark:text-gray-400">Filter by content type</div>
  </div>
  
  <div class="my-4 flex flex-wrap items-center">
    <button bind:this={index_cancel_button} on:click={cancelIndex} disabled type="button" class="mr-2 rounded bg-orange-500 px-4 py-2 text-white disabled:bg-orange-200 disabled:opacity-75 dark:bg-orange-700 dark:disabled:bg-orange-400">Cancel</button>
    <button bind:this={index_start_button} on:click={startIndex} type="button" class="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-blue-200 dark:bg-blue-700 dark:disabled:bg-blue-400">Start</button>
  </div>
</div>
