<script>
    import Photos from "$lib/photos.svelte";
    import {likedImagesStore} from "$lib/stores.js"
</script>
    

<div>
    <div class="text-6xl py-8 text-center">Favourites</div>
    <Photos images_data={$likedImagesStore} />
</div>
