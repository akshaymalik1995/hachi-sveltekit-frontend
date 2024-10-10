<script>
    import Photos from "$lib/photos.svelte";
    import {likedImagesStore} from "$lib/stores.js"
</script>
    

<div class="p-4" >
    <Photos images_data={$likedImagesStore} />
</div>
