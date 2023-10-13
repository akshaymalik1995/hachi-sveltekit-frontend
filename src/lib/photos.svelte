<script>
  console.log("PHOTOS COMPONENT RENDERED");
  import { DOMAIN } from "$lib/stores";
  import {goto} from "$app/navigation"
  import {page} from "$app/stores"
  import ImageView from "$lib/ImageView.svelte";
  export let imageData;
  export let pageSize = { lowerIndex: 0, upperIndex: 12 };
  
  document.body.style.overflow = "auto";
  let imageViewState = {
    isActive: false,
    currentImageData: {},
    currentImageIndex: {},
  };


  function closeImageView() {
    document.body.style.overflow = "auto";
    imageViewState.isActive = false;
    imageViewState.currentImageData = {};
  }
  function openImageView(index) {
    document.body.style.overflow = "hidden";
    imageViewState.isActive = true;
    updateImageViewData(index);
  }

  function updateImageViewData(i) {
     // We recieve what the index of the photo in the list_dataHash
     const currentPage = Number($page.url.searchParams.get('page')) || 1
    const path = $page.url.pathname
    // We receive the index of the image on the page as if it is the first image on the page or the last image
    i = Number(i);
  
    // We calculate how many images we show on the page
    const lastImageIndex = Math.min(pageSize.upperIndex, imageData.list_dataHash.length) - pageSize.lowerIndex - 1


    if (i > lastImageIndex){
      closeImageView()
      goto(path + "?page=" + (currentPage + 1))
      return
    } else if (i < 0) {
      closeImageView()
      if (currentPage > 1){
        goto(path + "?page=" +  (currentPage - 1))
      }
      return
    }
    
    imageViewState.currentImageIndex = i
    let imageIx = imageData.sortedScoreIndex.slice(pageSize.lowerIndex , pageSize.upperIndex)[i].ix
    imageViewState.currentImageData = {
      hash: imageData.list_dataHash[imageIx],
      metadata: imageData.list_metaData[imageIx],
      personIds : imageData.list_metaData[imageIx]['person'] || []
    };
  }

  
</script>

{#if imageViewState.isActive}
  <ImageView
    on:closeImageView={closeImageView}
    on:showNextImage={() =>
      updateImageViewData(imageViewState.currentImageIndex + 1)}
    on:showPreviousImage={() =>
      updateImageViewData(imageViewState.currentImageIndex - 1)}
    imageViewData={imageViewState.currentImageData}
  />
{/if}

<!-- SHOW ALL AVAILABLE PHOTOS -->
{#if imageData["sortedScoreIndex"]}
  <div class="grid grid-cols-3  gap-8  p-4 mb-12 sm:p-12 px-auto">
      {#each imageData["sortedScoreIndex"].slice(pageSize.lowerIndex, Math.min(pageSize.upperIndex, imageData.list_dataHash.length )) as score, i}
      <!-- (-1) here would indicate invalid index. so ignore that index -->

      {#if score["ix"] >= 0}
        <div class="relative my-2 rounded-lg w-full flex justify-center group">
          <!-- svelte-ignore a11y-img-redundant-alt -->
          <!-- svelte-ignore a11y-img-redundant-alt -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <a class="shadow-6 bg-gray-200 shadow-black rounded-lg flex justify-center items-center w-full rounded-lg " href="#">
            <img
            class=" w-full rounded-lg shadow-xl cursor-pointer"
            on:click={(e) => openImageView(i)}
            src={DOMAIN + "/getRawData/" + imageData.list_dataHash[score.ix]}
            alt="image"
          />
          </a>
          
        </div>
      {/if}
    {/each}
    </div>
{/if}
