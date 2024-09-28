<script>
  import { Modal, Tooltip } from 'flowbite-svelte';
  import {EditOutline, ZoomInSolid, CloseCircleOutline} from "flowbite-svelte-icons"
  import { DOMAIN } from "$lib/stores";
  export let data;
  console.log("DATA", data)
  const { images_data } = data
  let imagespath = Object.keys(images_data).sort((a, b) => Number(images_data[b].score) - Number(images_data[a].score))
  console.log(imagespath)
  let currentPage = 1;
  let itemsPerPage = 20;
  let imageModal = false
  let totalPages = Math.ceil(imagespath.length / itemsPerPage);

  function paginate() {
      const total = 10
      scrollToTop()
      if (totalPages <= total) {
          return Array.from({ length: totalPages }, (_, i) => i + 1);
          } else {
              const start = Math.max(1, Math.floor((currentPage - 1) / total) * total + 1);
              const end = Math.min(totalPages, start + total - 1);
              return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
  }

  function scrollToTop() {
      window.scrollTo(0, 0);
  }

  let pagesnumbers = paginate()

  function getPaginatedItems(pageNumber) {
      const startIndex = (pageNumber - 1) * itemsPerPage;
      const endIndex = pageNumber * itemsPerPage;
      return imagespath.slice(startIndex, endIndex)
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

  function loadPrevImage(index){
      modalImageIndex = index
      let modalimagepath = getPaginatedItems(currentPage)[index]
      modalimage = images_data[modalimagepath]
      if (!modalimage) {
          prevPage()
          loadPrevImage(0)
      }
  }

  function loadNextImage(index){
      modalImageIndex = index
      let modalimagepath = getPaginatedItems(currentPage)[index]
      modalimage = images_data[modalimagepath]
      if (!modalimage) {
          nextPage()
          loadNextImage(0)
      }
  }

  function onImageModalClick(index){
      modalImageIndex = index
      imageModal = true
      let modalimagepath = getPaginatedItems(currentPage)[index]
      modalimage = images_data[modalimagepath]
  }

  let imageview
  let modalimage = null
  let modalImageIndex = null
</script>


<div class="flex justify-center items-center">
  <Modal dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-50 w-full flex" bodyClass='bg-white h-full' headerClass='hidden' autoclose class="h-screen" title="Image" size="xl" bind:open={imageModal}>
      <div bind:this={imageview} class='w-full h-full items-center flex justify-center'>
          <!-- svelte-ignore a11y-img-redundant-alt -->
          <img class="w-auto h-full shadow-xl cursor-pointer" src={DOMAIN + "/getRawDataFull/" + modalimage.hash} alt="image" />
          
          <!-- Add navigation buttons -->
          <button class="absolute top-1/2 left-6 flex justify-center items-center z-10 -mt-5 w-10 h-10 bg-gray-800 text-white rounded-full focus:outline-none" on:click={() => loadPrevImage(modalImageIndex - 1)}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
          </button>
  
          <button class="absolute top-1/2 right-6 z-10 flex justify-center items-center -mt-5 w-10 h-10 bg-gray-800 text-white rounded-full focus:outline-none" on:click={() => loadNextImage(modalImageIndex + 1)}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
          </button>

          <!-- Add icons for fullscreen, edit, open in file, favorite -->
      <div class="absolute  inset-x-0 top-4 flex justify-center space-x-4">
          <button class="rounded w-8 h-8 flex items-center justify-center bg-gray-800 focus:outline-none">
             <EditOutline />
          </button>
          <Tooltip>Edit Details</Tooltip>
          <button on:click={() => {imageview.requestFullscreen()}} class="rounded w-8 h-8 flex items-center justify-center bg-gray-800 focus:outline-none">
              
          <div><ZoomInSolid  /></div>
          </button>
          <Tooltip>Fullscreen</Tooltip>
          <button on:click={() => {imageModal = false}} class="rounded w-8 h-8 flex items-center justify-center bg-gray-800 focus:outline-none">
              
              <div><CloseCircleOutline  /></div>
              </button>
              <Tooltip>Close</Tooltip>
      </div>
      </div> 
  </Modal>
</div>

<div class="px-4">
  <div class='grid md:grid-cols-3 lg:grid-cols-5 gap-4'>
      {#each getPaginatedItems(currentPage) as image, index}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div on:click={() => onImageModalClick(index)} class="flex justify-center rounded-lg items-center" >
          <div class='relative overflow-hidden rounded-lg shadow-md'>
              <!-- svelte-ignore a11y-img-redundant-alt -->
              <img loading="lazy" class="w-full h-48 rounded-lg  shadow-xl cursor-pointer" src={DOMAIN + "/getRawData/" + images_data[image].hash} alt="image" />
          </div>
      </div>
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
