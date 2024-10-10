<script>
  import Photos from "../../lib/photos.svelte";
  import { calendarImagesStore } from "$lib/stores";
  let months = Object.keys($calendarImagesStore);
  let selectedMonth = months[0];
  let filteredImages = [];

  function filterImagesByMonth(month) {
    filteredImages = structuredClone($calendarImagesStore[month]);
  }

  filterImagesByMonth(selectedMonth);
</script>

<div class="px-4">
  <div class="text-center my-8 text-6xl">Gallery</div>
  <!-- I want to display months as folders -->

  <div class="month-selector mb-8">
    <select
      bind:value={selectedMonth}
      on:change={() => filterImagesByMonth(selectedMonth)}
      class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {#each months as month, index}
        <option value={month} class="text-gray-600">{month}</option>
      {/each}
    </select>
  </div>

  <Photos images_data={filteredImages} />
</div>
