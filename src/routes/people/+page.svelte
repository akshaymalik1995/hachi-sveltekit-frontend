<script>
    import People from "$lib/People.svelte";
    import Pagination from "$lib/Pagination.svelte";
    import { page } from '$app/stores';
    export let data
    const {people_list, people_data} = data
    const peopleDataKeyValue = Object.entries(people_data)
    peopleDataKeyValue.sort((a, b) => b[1].numOfPhotos - a[1].numOfPhotos)
    
    const imagesOnAPage = 25
    let currentPage = 1
    let totalPages = Math.ceil(people_list.length / imagesOnAPage)
    let peopleListForThePage = people_list.slice((currentPage - 1) * imagesOnAPage, imagesOnAPage * currentPage)
    $: {
        currentPage = Number($page.url.searchParams.get('page')) || 1
        peopleListForThePage = peopleDataKeyValue.slice((currentPage - 1) * imagesOnAPage, imagesOnAPage * currentPage)
    }
</script>
    

<div>
    
    <div class="text-6xl py-8 text-center">People</div>
    <People people_list={peopleListForThePage} />
    <Pagination {totalPages} {currentPage} />
</div>
