<script>
    import Photos from "$lib/photos.svelte";
    import Pagination from "$lib/Pagination.svelte"
    import {argSort} from "$lib/utils"
    import { page } from '$app/stores';
    export let data;
    const people_data = data.people_data
    const person_id = $page.params.person_id
    const imageData = people_data[person_id]
    imageData['sortedScoreIndex'] = argSort(imageData.list_score)
    const imagesOnAPage = 100;
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

<Photos imageData={imageData} pageSize = {{lowerIndex : lowerIndex, upperIndex : upperIndex}} />
<Pagination {totalPages} {currentPage} />
