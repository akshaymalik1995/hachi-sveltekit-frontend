<script>

    import { DOMAIN } from "$lib/stores";
    export let data;
    const { image_data, directories_data } = data;
    let directories = Object.keys(directories_data);
    let currentPage = 1;
    let itemsPerPage = 10;
    let totalPages = Math.ceil(directories.length / itemsPerPage);

    function paginate() {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            const start = Math.max(1, Math.floor((currentPage - 1) / 5) * 5 + 1);
            const end = Math.min(totalPages, start + 4);
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
    }

    let pagesnumbers = paginate()

    function getPaginatedItems(pageNumber) {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = pageNumber * itemsPerPage;
        return directories.slice(startIndex, endIndex);
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
        }
        pagesnumbers = paginate()
    }

    function nextPage() {
        
        if (currentPage < totalPages) {
            currentPage++;
        }
        pagesnumbers = paginate()
    }
</script>

<div>
   
    <div class="text-center my-8 text-6xl">Gallery</div>
    <!-- I want to display directories as folders -->

    <div class='grid md:grid-cols-3 xl:grid-cols-6 gap-8'>
        {#each getPaginatedItems(currentPage) as directory}
            <a href={'/photos/' + encodeURIComponent(directory)} class='flex gap-2 flex-col cursor-pointer hover:bg-blue-200 py-4 px-4 rounded'>
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img class="h-48 rounded-lg shadow-xl cursor-pointer" src={DOMAIN + "/getRawData/" + directories_data[directory].list_dataHash[0]} alt="image" />
            </a>
        {/each}
    </div>

    <div class="flex mx-3 justify-between items-center" >
        <div class="my-2 px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Page {currentPage} of {totalPages}
        </div>

        <nav class="my-8" aria-label="Pagination">

            <ul class="inline-flex -space-x-px">
                <li>
                    <button 
                        class="px-3 py-2 ml-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        on:click={prevPage}
                        disabled={currentPage <= 1}
                        class:opacity-50="{currentPage <= 1}"
                    >
                        &#x2190; Previous
                    </button>
                </li>
                {#each pagesnumbers as page}
                    <li>
                        <button 
                            class={`px-3 py-2 ml-2 border rounded-md text-sm font-medium text-gray-700 ${currentPage === page ? "bg-blue-200 hover:bg-blue-100" : 'hover:bg-gray-100 bg-white'} `}
                            on:click={() => currentPage = page}
                        >
                            {page}
                        </button>
                    </li>
                {/each}
                <li>
                    <button 
                        class="px-3 py-2 ml-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        on:click={nextPage}
                        disabled={currentPage >= totalPages}
                        class:opacity-50="{currentPage >= totalPages}"
                    >
                        Next &#x2192;
                    </button>
                </li>
            </ul>
        </nav>
    </div>
    

</div>
