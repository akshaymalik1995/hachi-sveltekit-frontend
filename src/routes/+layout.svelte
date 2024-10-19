<script>
    import Sidebar from "$lib/Sidebar.svelte"
    import {imagesDataStore, likedImagesStore, calendarImagesStore, peopleListStore, directoriesDataStore, peopleDataStore} from "$lib/stores.js"
    export let data
    const {images_data, likedImagesData, calendarImagesData, people_list, directories_data, people_data} = data

    $ : {
        $imagesDataStore = images_data
    }

    $ : {
        $likedImagesStore = likedImagesData
    }

    $ : {
        $calendarImagesStore = calendarImagesData
    }
    $ : {
        $peopleListStore = people_list
    }
    $ : {
        $directoriesDataStore = directories_data
    }
    $ : {
        $peopleDataStore = people_data
    }

</script>

<div class="flex">
    <Sidebar />
    <div class='grow  w-full bg-gray-900 text-white mx-auto'>
        <div class='relative px-8 max-w-[1600px] w-full  mx-auto'>
            <slot />
        </div>
        
    </div>
    
</div>                                   