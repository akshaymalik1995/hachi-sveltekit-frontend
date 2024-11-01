
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
    <div class="grow text-center">
      <div class="text-lg sm:text-xl lg:text-4xl inline-block p-2 text-black dark:text-white">{month.toUpperCase()}</div>
    </div>
  </div>
    <Photos images_data={imagesdata} />
</div>
