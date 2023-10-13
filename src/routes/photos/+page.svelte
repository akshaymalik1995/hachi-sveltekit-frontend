<script>
    import Photos from "$lib/photos.svelte";
    import Pagination from "$lib/Pagination.svelte";
    import { page } from "$app/stores";
    export let data;
    const { image_data } = data;
    const imagesOnAPage = 100;
    let currentPage = 1;
    let totalPages = Math.ceil(image_data.list_dataHash.length / imagesOnAPage);
    let lowerIndex = (currentPage - 1) * imagesOnAPage;
    let upperIndex = imagesOnAPage * currentPage;

    $: {
        currentPage = Number($page.url.searchParams.get("page")) || 1;
        lowerIndex = (currentPage - 1) * imagesOnAPage;
        upperIndex = imagesOnAPage * currentPage;
    }
</script>

<div>
   
   
    <div class="text-center my-8 text-6xl">Gallary</div>
    <Photos imageData={image_data} pageSize={{ lowerIndex, upperIndex }} />
    <Pagination {currentPage} {totalPages} />
    
   
</div>
