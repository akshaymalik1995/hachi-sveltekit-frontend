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

<style>
  .card {
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
</style>

<div class="p-4">
  <div class="flex justify-center gap-5 flex-wrap">
    {#each months as month}
      <div class="card flex shadow-xl rounded-lg bg-gray-100 dark:bg-gray-900 w-full xs:w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex-col">
        <div class="relative rounded-t-lg overflow-hidden">
          <a href={`calendar/${month}`}>
            <img
              loading="lazy"
              class="w-full h-64 object-cover cursor-pointer transform transition-transform duration-500 hover:scale-110"
              src={DOMAIN + "/getRawData/" + $calendarImagesStore[month]["data_hash"][0]}
              alt="image"
            />
          </a>
        </div>
        <div class="p-2 rounded-b-lg dark:bg-gray-700 dark:text-white text-center font-bold">{month}</div>
      </div>
    {/each}
  </div>
</div>

