
<script>
    import Photos from "$lib/photos.svelte";
    import {directoriesDataStore} from "$lib/stores.js";
    import { page } from '$app/stores';

    const path = decodeURIComponent($page.params.path);
    const imagesdata = $directoriesDataStore[path];

</script>



<div class="">
    <div class="flex justify-center items-center">
        <button
          class="bg-gray-800 hover:bg-gray-700 text-gray-500 font-bold py-2 px-4 rounded"
          onclick="window.history.back()">Back</button
        >
        <div class="grow text-center">
          <div class="text-4xl -translate-x-1/2 inline-block p-8">{path.toUpperCase()}</div>
        </div>
      </div>
<Photos images_data={imagesdata} />
</div>