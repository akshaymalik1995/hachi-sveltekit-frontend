<script>
  import { Modal, Tooltip } from "flowbite-svelte";
  import {
    EditOutline,
    ZoomInSolid,
    CloseCircleOutline,
    HeartOutline,
    HeartSolid
  } from "flowbite-svelte-icons";
  import InfiniteScroll from "./InfiniteScroll.svelte";
  import { DOMAIN } from "$lib/stores";

  export let images_data;
  console.log("IMAGES DATA", images_data);

  $: {
    imagesloadedcount = 20;
    images_data = images_data;
  }

  let imagesloadedcount = 20;

  let imageModal = false;

  let imageCard = {};

  function getImageData(index) {
    const { ix } = images_data.scoreIndex[index];
    return images_data.meta_data[ix];
  }

  function loadMoreImages() {
    imagesloadedcount += 20;
  }

  function loadPrevImage(index) {
    imageCard = getImageData(index);
    // update_image_card_previous();
    modalImageIndex = index;
    modalimagehash = getImageHash(index);
  }

  function loadNextImage(index) {
    imageCard = getImageData(index);
    // update_image_card_next();
    modalImageIndex = index;
    modalimagehash = getImageHash(index);
  }

  function getImageHash(index) {
    const { ix } = images_data.scoreIndex[index];
    console.log();
    return images_data.data_hash[ix];
  }

  function onImageModalClick(index) {
    imageCard = getImageData(index);
    modalImageIndex = index;
    imageModal = true;
    modalimagehash = getImageHash(index);
  }

  let imageview;
  let modalimagehash = null;
  let modalImageIndex = null;

  /// FOR BOXES
  let loadTimeoutId;

  let scaled_face_bboxes = []; // to hold the array of scaled face bboxes, according to dimensions of image being currently shown.
  let full_image_loaded = true;
  
  function scale_face_bboxes(node) {
    let card_rects = node.target.getClientRects()[0];
    let card_width = card_rects.width;
    let card_height = card_rects.height;

    const offsetLeft = node.target.offsetLeft;
    let result = [];
    let original_bboxes = imageCard.face_bboxes;
    if (original_bboxes) {
      let image_width = imageCard.width;
      let image_height = imageCard.height;

      // Swap width and height if the image is in portrait mode
      if (image_height > image_width) {
        [image_width, image_height] = [image_height, image_width];
      }

      for (let i = 0; i < original_bboxes.length; i++) {
        let temp_bbox = structuredClone(original_bboxes[i]); // [x1, y1, x2, y2]

        let w_scale = Number(card_width) / (Number(image_width) + 1e-4);
        let h_scale = Number(card_height) / (Number(image_height) + 1e-4);

        temp_bbox.top = temp_bbox[1] * h_scale;
        temp_bbox.height = (temp_bbox[3] - temp_bbox[1]) * h_scale;

        temp_bbox.left = temp_bbox[0] * w_scale + offsetLeft;
        temp_bbox.width = (temp_bbox[2] - temp_bbox[0]) * w_scale;

        result.push(temp_bbox);
      }
    }
    scaled_face_bboxes = result;

    if (loadTimeoutId) {
      clearTimeout(loadTimeoutId);
    }
    full_image_loaded = true;
  }


//   let editForm = {}

  let current_box_ix; // current selected face bbox for an image.

  let tag_interface = {
    active: false,
    top: null,
    left: null,
  };




  async function handleImageLike(event, meta_data, data_hash) {
    event.stopPropagation();
    try {
      meta_data['is_favourite'] = "true"
      const formData = new FormData();
      formData.append('data_hash', data_hash);
      for (const [key, value] of Object.entries(meta_data)) {
        formData.append(key, value);
      }

      const response = await fetch(DOMAIN + '/editMetaData', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Failed to update metadata');
      } else {
        meta_data['is_favourite'] = 'true'
      }
    } catch (error) {
      console.error('An error occurred during image like handling:', error);
    }
  }

</script>

<div class="flex justify-center items-center">
  <Modal
    dialogClass="fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-50 w-full flex"
    bodyClass="bg-white h-full"
    headerClass="hidden"
    autoclose
    class="h-screen"
    title="Image"
    size="xl"
    bind:open={imageModal}
  >
    <div
      bind:this={imageview}
      class="w-full h-full items-center flex justify-center"
    >
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img
        on:load={scale_face_bboxes}
        class="w-auto h-full shadow-xl cursor-pointer"
        src={DOMAIN + "/getRawData/" + modalimagehash}
        alt="image"
      />

      <!-- TODO: calculate scale -->
      {#each scaled_face_bboxes as box, i}
        <!-- svelte-ignore missing-declaration -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          on:click={(e) => {
            tag_interface = { active: true, top: box.top - 28, left: box.left };
            current_box_ix = Number(e.target.attributes["data-ix"].value);
          }}
          data-ix={i}
          class="absolute text-white cursor-pointer border-solid border-2 border-green-300 hover:opacity-40 hover:bg-green-300 bg-transparent"
          style="top: {box.top}px ; left: {box.left}px; width: {box.width}px; height: {box.height}px"
        ></div>
      {/each}

      <div class="absolute flex justify-center bottom-0">
        <div class="flex gap-4">
          {#each imageCard.person as person}
            {#if person !== "no person detected"}
              <a
                target="_blank"
                href={"/search?person=" + person}
                class="flex items-center"
              >
                <img
                  loading="lazy"
                  src={DOMAIN + "/getPreviewPerson/" + person}
                  class="object-strech border-2 rounded-lg w-24 h-24 bg-gray-100 border-gray-100 shadow-smr"
                  alt=""
                />
              </a>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Add navigation buttons -->
      <button
        class="absolute top-1/2 left-6 flex justify-center items-center z-10 -mt-5 w-10 h-10 bg-gray-800 text-white rounded-full focus:outline-none"
        on:click={() => loadPrevImage(modalImageIndex - 1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        class="absolute top-1/2 right-6 z-10 flex justify-center items-center -mt-5 w-10 h-10 bg-gray-800 text-white rounded-full focus:outline-none"
        on:click={() => loadNextImage(modalImageIndex + 1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <!-- Add icons for fullscreen, edit, open in file, favorite -->
      <div class="absolute inset-x-0 top-4 flex justify-center space-x-4">
        <button
          class="rounded w-8 h-8 flex items-center justify-center bg-gray-800 focus:outline-none"
        >
          <EditOutline />
        </button>
        <Tooltip>Edit Details</Tooltip>
        <button
          on:click={() => {
            imageview.requestFullscreen();
          }}
          class="rounded w-8 h-8 flex items-center justify-center bg-gray-800 focus:outline-none"
        >
          <div><ZoomInSolid /></div>
        </button>
        <Tooltip>Fullscreen</Tooltip>
        <button
          on:click={() => {
            imageModal = false;
          }}
          class="rounded w-8 h-8 flex items-center justify-center bg-gray-800 focus:outline-none"
        >
          <div><CloseCircleOutline /></div>
        </button>
        <Tooltip>Close</Tooltip>
      </div>
    </div>
  </Modal>
</div>

<div class="px-4">
  <div class="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
    <InfiniteScroll loadMoreFunction={loadMoreImages} threshold={100}>
      {#each images_data.scoreIndex.slice(0, imagesloadedcount) as scoreindex, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={() => onImageModalClick(index)}
          class="flex bg-gray-200 justify-center rounded-lg items-center"
        >
          <div class="relative overflow-hidden rounded-lg shadow-md">
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img
              loading="lazy"
              class="w-full h-48 rounded-lg shadow-xl cursor-pointer"
              src={DOMAIN +
                "/getRawData/" +
                images_data["data_hash"][scoreindex.ix]}
              alt="image"
            />
            <!-- Add like icon at the bottom -->
            <div class="absolute flex bottom-0 left-0 right-0 justify-center mb-2">
              <div on:click={(event) => handleImageLike(event, images_data["meta_data"][scoreindex.ix], images_data["data_hash"][scoreindex.ix])} class={"cursor-pointer hover:bg-gray-100 p-1 rounded"}>
                {#if images_data["meta_data"][scoreindex.ix].is_favourite == "true"}
                <HeartSolid color='red' />
                {:else}
                <HeartOutline />
                {/if}
                
              </div>
              
            </div>
          </div>
        </div>
      {/each}
    </InfiniteScroll>
  </div>
</div>
