<script>
  import Photos from "../../lib/photos.svelte";
  import { calendarImagesStore, DOMAIN } from "$lib/stores";
  let months = sortDatesDescending(Object.keys($calendarImagesStore));
  let selectedMonth = months[0];
  let filteredImages = [];

  function sortDatesDescending(dateStrings) {
    const dates = dateStrings.map((dateString) => {
      const [month, year] = dateString.split(" ");
      const monthIndex = getMonthIndex(month);
      return new Date(year, monthIndex);
    });

    dates.sort((a, b) => b - a);

    return dates.map((date) => {
      const month = getMonthString(date.getMonth());
      const year = date.getFullYear();
      return `${month} ${year}`;
    });
  }

  function getMonthIndex(month) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames.indexOf(month);
  }

  function getMonthString(monthIndex) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[monthIndex];
  }

  function filterImagesByMonth(month) {
    filteredImages = structuredClone($calendarImagesStore[month]);
  }

  filterImagesByMonth(selectedMonth);
</script>

<div class="p-4">
  <!-- I want to display months as folders -->

  <div class="flex justify-center gap-3 flex-wrap">
    {#each months as month}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="flex bg-gray-800 w-64 flex-col justify-center items-center">
        <div class="relative overflow-hidden shadow-md">
          <!-- svelte-ignore a11y-img-redundant-alt -->
          <a href={`calendar/${month}`}>
            <img
              loading="lazy"
              class="w-64 h-64 shadow-xl cursor-pointer transform transition-transform duration-500 hover:scale-110"
              src={DOMAIN +
                "/getRawData/" +
                $calendarImagesStore[month]["data_hash"][0]}
              alt="image"
            />
          </a>
        </div>
        <div class="p-2 text-bold">{month}</div>
      </div>
    {/each}
  </div>
</div>
