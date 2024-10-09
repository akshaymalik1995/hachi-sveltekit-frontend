<script>
    import Sidebar from "$lib/Sidebar.svelte"
    import {imagesDataStore, likedImagesStore} from "$lib/stores.js"
    export let data
    const {images_data, likedImagesData} = data

    $ : {
        $imagesDataStore = images_data
    }

    $ : {
        $likedImagesStore = likedImagesData
    }
</script>


<div class="flex">
    <Sidebar />
    <div class='grow  w-full bg-gray-100 mx-auto'>
        <div class='relative max-w-[1600px] w-full  mx-auto'>
            <slot />
        </div>
        
    </div>
    
</div>                                   