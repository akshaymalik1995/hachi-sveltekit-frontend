
<script>
    import Photos from "$lib/photos.svelte";
    import {directoriesDataStore} from "$lib/stores.js";
    import { page } from '$app/stores';

    const path = decodeURIComponent($page.params.path);
    const imagesdata = $directoriesDataStore[path];

</script>



<div class="px-16">
<div class="flex justify-center items-center">
    <button class="bg-gray-800 hover:bg-gray-700 text-gray-500 font-bold py-2 px-4 rounded" onclick="window.history.back()">Back</button>
    <div class="text-4xl grow py-8 text-center">{path}</div>
</div>
<Photos images_data={imagesdata} />
</div>