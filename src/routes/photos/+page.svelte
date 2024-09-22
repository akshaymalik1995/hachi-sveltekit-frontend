<script>

    import { DOMAIN } from "$lib/stores";
    export let data;
    console.log("DATA", data)
    const { images_data, directories_data } = data
    let directories = Object.keys(directories_data);
    let selectedDirectory = '';
    let filteredImages = [];
    let currentPage = 1;
    let itemsPerPage = 50;
    let totalPages = Math.ceil(images_data.length / itemsPerPage);

    function paginate() {
    scrollToTop()
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            const start = Math.max(1, Math.floor((currentPage - 1) / 5) * 5 + 1);
            const end = Math.min(totalPages, start + 4);
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
    }

    function scrollToTop() {
        window.scrollTo(0, 0);
    }

    

    function filterImagesByDirectory(dir) {
        selectedDirectory = dir;
        filteredImages = [];
        if (dir === '') {
            filteredImages = images_data;
        } else {
            filteredImages = directories_data[dir];
        }
        totalPages = Math.ceil(filteredImages.length / itemsPerPage);
        resetpaginaion()
    }

    function getFilteredImages() {
        return filteredImages;
    }


    $: {
        // Initialize with all images
        filterImagesByDirectory('');
    }

    let pagesnumbers = paginate()

    function getPaginatedItems(pageNumber, dir) {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = pageNumber * itemsPerPage;
        if (dir) {
            return directories_data[dir].slice(startIndex, endIndex)
        } 
        return images_data.slice(startIndex, endIndex)
        
    }

    function resetpaginaion(){
        currentPage = 1
        pagesnumbers = paginate()
        
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
        }
        pagesnumbers = paginate()
        
    }

   function changepage(page){
        scrollToTop()
        currentPage = page
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

    <div class="directory-selector mb-8">
        <select bind:value={selectedDirectory} on:change={() => filterImagesByDirectory(selectedDirectory)} class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="" class="text-gray-600">All Directories</option>
            {#each directories as dir}
                <option value={dir} class="text-gray-600">{dir.slice(0, dir.length - 1)}</option>
            {/each}
        </select>
    </div>

    <div class='grid md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {#each getPaginatedItems(currentPage, selectedDirectory) as image}
            <a href={'/photos/' + encodeURIComponent(image.meta.absolute_path)} class='relative overflow-hidden rounded-lg shadow-md'>
                <!-- svelte-ignore a11y-img-redundant-alt -->
                <img class="w-full h-auto rounded-lg shadow-xl cursor-pointer" src={DOMAIN + "/getRawData/" + image.hash} alt="image" />
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
                            on:click={() => changepage(page)}
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
