<script>
    import Photos from "$lib/photos.svelte";
    import {imagesDataStore} from "$lib/stores.js"
</script>
    

<div class="" >
    <Photos sortDescending={true} images_data={$imagesDataStore} />
</div>