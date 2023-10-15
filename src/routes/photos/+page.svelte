<script>
    import Photos from "$lib/photos.svelte";
    import Pagination from "$lib/Pagination.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    export let data;
    const { image_data, directories_data } = data;
    let filteredImageData = image_data
    const directories = Object.keys(directories_data)
    const imagesOnAPage = 50;
    let currentPage = 1;
    let totalPages = Math.ceil(filteredImageData.list_dataHash.length / imagesOnAPage);
    let lowerIndex = (currentPage - 1) * imagesOnAPage;
    let upperIndex = imagesOnAPage * currentPage;

    $: {
        totalPages = Math.ceil(filteredImageData.list_dataHash.length / imagesOnAPage);
        currentPage = Number($page.url.searchParams.get("page")) || 1;
        lowerIndex = (currentPage - 1) * imagesOnAPage;
        upperIndex = imagesOnAPage * currentPage;
        console.log(lowerIndex, upperIndex)
    }
    
    function changeDirectory(e){
        const dir = e.target.value
        if (dir === 'all'){
            filteredImageData = image_data
        } else {
            filteredImageData = directories_data[dir]
        }
        
        goto("/photos")
        
        
    }
</script>

<div>
   
    
   
    <div class="text-center my-8 text-6xl">Gallary</div>

    <div class="mx-12">
        <select class="w-full px-4  py-2 rounded" on:change={changeDirectory} name="" id="">
            <option  selected value="all">All</option>
            {#each directories as d}
            <option value="{d}">{d}</option>
            {/each}
           
        </select>
    </div>
    
    <Photos imageData={filteredImageData} pageSize={{ lowerIndex, upperIndex }} />
    <Pagination {currentPage} {totalPages} />
    
   
</div>
