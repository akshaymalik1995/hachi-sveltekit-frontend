<script>
    import Photos from "$lib/photos.svelte";
    import Pagination from "$lib/Pagination.svelte"
    import {argSort} from "$lib/utils"
    import {goto} from "$app/navigation"
    import { page } from '$app/stores';
    export let data
    const directories_data = data.directories_data
    const dir = decodeURIComponent($page.params.path) 
    const imageData = directories_data[dir]
    imageData['sortedScoreIndex'] = argSort(imageData.list_score)
    const imagesOnAPage = 50;
    let currentPage = 1;
    let totalPages = Math.ceil(imageData.list_dataHash.length / imagesOnAPage);
    let lowerIndex = (currentPage - 1) * imagesOnAPage;
    let upperIndex = imagesOnAPage * currentPage;
    console.log(imageData)
    $: {
        currentPage = Number($page.url.searchParams.get("page")) || 1;
        lowerIndex = (currentPage - 1) * imagesOnAPage;
        upperIndex = imagesOnAPage * currentPage;
    }
</script>

<button on:click={e => goto('/photos')} class=' mx-12 inline-block my-4 px-4 py-2 bg-blue-400 cursor-pointer hover:bg-blue-300 rounded' href="/photos">Back</button>

<Photos imageData={imageData} pageSize = {{lowerIndex : lowerIndex, upperIndex : upperIndex}} />
<Pagination {totalPages} {currentPage} />