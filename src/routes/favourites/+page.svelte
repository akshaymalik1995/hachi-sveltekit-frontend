<script>
    import Photos from "$lib/photos.svelte";
    import {likedImagesStore} from "$lib/stores.js"
</script>
    

<div class="" >
    <Photos images_data={$likedImagesStore} />
</div>
