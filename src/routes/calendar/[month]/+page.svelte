
    <script>
        import Photos from "$lib/photos.svelte";
        import {calendarImagesStore} from "$lib/stores.js";
        import { page } from '$app/stores';

        console.debug("Page store:", $page);

        const month = decodeURIComponent($page.params.month);
        console.debug("Month parameter:", month);

        const imagesdata = $calendarImagesStore[month];
        console.debug("Images data for the month:", imagesdata);
    </script>

    

<div class="">
    <div class="flex justify-center items-center">
        <button
          class="bg-gray-800 hover:bg-gray-700 text-gray-500 font-bold py-2 px-4 rounded"
          onclick="window.history.back()">Back</button
        >
        <div class="grow text-center">
          <div class="text-4xl -translate-x-1/2 inline-block p-8">{month.toUpperCase()}</div>
        </div>
      </div>
    <Photos images_data={imagesdata} />
</div>
