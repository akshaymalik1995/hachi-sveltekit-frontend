<script>
  import Photos from "$lib/photos.svelte";
  import {directoriesDataStore} from "$lib/stores.js";
  import { page } from '$app/stores';

  const path = decodeURIComponent($page.params.path);
  const imagesdata = $directoriesDataStore[path];
</script>

<div class="dark:bg-gray-900 bg-white min-h-screen">
  <div class="flex justify-center items-center">
    <div class="grow text-center">
      <div class="text-lg sm:text-xl lg:text-4xl inline-block p-2 text-black dark:text-white">{path.toUpperCase()}</div>
    </div>
  </div>
  <Photos images_data={imagesdata} />
</div>
