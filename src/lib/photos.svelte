<script>
  import {
    Modal,
    Tooltip,
    Input,
    Label,
    Checkbox,
    Button,
    Spinner,
  } from "flowbite-svelte";
  import {
    imagesDataStore,
    likedImagesStore,
    peopleListStore,
  } from "$lib/stores.js";
  import {
    EditOutline,
    ZoomInSolid,
    CloseCircleOutline,
    HeartOutline,
    HeartSolid,
  } from "flowbite-svelte-icons";
  import InfiniteScroll from "./InfiniteScroll.svelte";
  import { DOMAIN } from "$lib/stores";
  import {
    getMonthYear,
    parseDate,
    getDateString,
    sortImageDataByDate,
  } from "$lib/utils";
  import PhotoDetail from "./PhotoDetail.svelte";
  import TopLoading from "./TopLoading.svelte";
  import { onDestroy, onMount } from "svelte";

  export let sortDescending = false;
  export let images_data;
  export let isSearch = false;
  console.log("IMAGES DATA", images_data);
  if (!isSearch) {
    images_data = sortImageDataByDate(images_data, sortDescending);
  }

  let imageModalContainer;

  onMount(() => {
    document.addEventListener("keydown", handlekeydown);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handlekeydown);
  });

  $: {
    imagesloadedcount = 50;
    if (!isSearch) {
      images_data = sortImageDataByDate(images_data, sortDescending);
    } else {
      images_data = images_data;
    }
  }

  let imagesloadedcount = 50;

  let imageModal = false;

  let imageCard = {};

  function getImageMetaData(index) {
    const { ix } = images_data.scoreIndex[index];
    return images_data.meta_data[ix];
  }

  function getImageData(index) {
    const { ix } = images_data.scoreIndex[index];
    return {
      meta_data: images_data.meta_data[ix],
      data_hash: images_data.data_hash[ix],
      score: images_data.score[ix],
      scoreIndex: images_data.scoreIndex[ix],
    };
  }

  function loadMoreImages() {
    imagesloadedcount += 20;
  }

  function loadPrevImage(index) {
    scaled_face_bboxes = [];
    imageCard = getImageMetaData(index);
    // update_image_card_previous();
    modalImageIndex = index;
    modalimagehash = getImageHash(index);
    // imageLoading = true;
  }

  function loadNextImage(index) {
    scaled_face_bboxes = [];
    imageCard = getImageMetaData(index);
    console.log(imageCard);
    // update_image_card_next();
    modalImageIndex = index;
    modalimagehash = getImageHash(index);
    // imageLoading = true;
  }

  function getImageHash(index) {
    const { ix } = images_data.scoreIndex[index];
    return images_data.data_hash[ix];
  }

  function onImageModalClick(index) {
    // imageLoading = true;
    scaled_face_bboxes = [];
    imageCard = getImageMetaData(index);
    console.log("image card", imageCard);
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
    if (imageCard.person === "no person detected") return;
    console.log("scale_face_bboxes called");
    let card_rects = node.target.getClientRects()[0];
    let card_width = card_rects.width;
    let card_height = card_rects.height;
    console.log(`card_width: ${card_width}, card_height: ${card_height}`);

    const offsetLeft = node.target.offsetLeft;
    console.log(`offsetLeft: ${offsetLeft}`);
    let result = [];
    let original_bboxes = imageCard.face_bboxes;
    if (typeof original_bboxes === "string") {
      original_bboxes = [
        original_bboxes.split(",").map((item) => Number(item.trim())),
      ];
    }
    if (original_bboxes) {
      console.log("original_bboxes found", original_bboxes);
      let image_width = imageCard.width;
      let image_height = imageCard.height;
      console.log(`image_width: ${image_width}, image_height: ${image_height}`);

      if (card_width < card_height) {
        [image_width, image_height] = [image_height, image_width];
        console.log("Image is in portrait mode, swapping dimensions");
        console.log(
          `image_width: ${image_width}, image_height: ${image_height}`
        );
      }

      for (let i = 0; i < original_bboxes.length; i++) {
        let temp_bbox = structuredClone(original_bboxes[i]); // [x1, y1, x2, y2]
        console.log(`Processing bbox ${i}: ${JSON.stringify(temp_bbox)}`);

        let w_scale = Number(card_width) / (Number(image_width) + 1e-4);
        let h_scale = Number(card_height) / (Number(image_height) + 1e-4);
        console.log(`w_scale: ${w_scale}, h_scale: ${h_scale}`);

        if (image_height > image_width) {
          [w_scale, h_scale] = [h_scale, w_scale];
        }

        temp_bbox.top = temp_bbox[1] * h_scale;
        temp_bbox.height = (temp_bbox[3] - temp_bbox[1]) * h_scale;
        temp_bbox.left = temp_bbox[0] * w_scale + offsetLeft;
        temp_bbox.width = (temp_bbox[2] - temp_bbox[0]) * w_scale;
        console.log("Scaled bbox:", temp_bbox);

        result.push(temp_bbox);
      }
    } else {
      console.log("No original_bboxes present");
    }
    scaled_face_bboxes = result;
    console.log("scaled_face_bboxes:", scaled_face_bboxes);

    if (loadTimeoutId) {
      clearTimeout(loadTimeoutId);
      console.log("Cleared loadTimeoutId");
    }
    full_image_loaded = true;
    console.log("full_image_loaded set to true");
  }
  //   let editForm = {}

  let current_box_ix; // current selected face bbox for an image.

  let tag_interface = {
    active: false,
    top: null,
    left: null,
  };

  async function handleImageLike(event, value, index) {
    const imagedata = getImageData(index);
    console.log(imagedata);
    const { meta_data, data_hash, score, scoreIndex } = imagedata;
    event.stopPropagation();
    try {
      meta_data["is_favourite"] = value;
      const formData = new FormData();
      formData.append("data_hash", data_hash);
      for (const [key, value] of Object.entries(meta_data)) {
        formData.append(key, value);
      }

      const response = await fetch(DOMAIN + "/editMetaData", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to update metadata");
      } else {
        if (value === "true") {
          $likedImagesStore["meta_data"] = [
            ...$likedImagesStore["meta_data"],
            meta_data,
          ];
          $likedImagesStore["data_hash"] = [
            ...$likedImagesStore["data_hash"],
            data_hash,
          ];
          $likedImagesStore["score"] = [...$likedImagesStore["score"], score];
          $likedImagesStore["scoreIndex"] = [
            ...$likedImagesStore["scoreIndex"],
            {
              ix: $likedImagesStore["scoreIndex"].length,
              score,
            },
          ];
        } else {
          const removeIndex = $likedImagesStore["data_hash"].findIndex(
            (item) => item === data_hash
          );
          $likedImagesStore["meta_data"] = $likedImagesStore[
            "meta_data"
          ].filter((item, index) => index !== removeIndex);
          $likedImagesStore["score"] = $likedImagesStore["score"].filter(
            (item, index) => index !== removeIndex
          );
          $likedImagesStore["scoreIndex"] = $likedImagesStore["scoreIndex"]
            .filter((item, index) => index !== removeIndex)
            .map((item, index) => ({ ix: index, score: item.score }));
          $likedImagesStore["data_hash"] = $likedImagesStore[
            "data_hash"
          ].filter((item, index) => index !== removeIndex);
        }
      }
    } catch (error) {
      console.error("An error occurred during image like handling:", error);
    }
  }

  // FORM MODAL
  let formModal = false;
  function handleImageSubmit(event) {
    event.preventDefault();

    let new_person_id = event.target["name"].value;
    console.log(new_person_id);
    if (!new_person_id) return;
    let old_person_id = imageCard.person[current_box_ix];

    let data = new FormData();
    data.append("new_person_id", new_person_id);
    data.append("old_person_id", old_person_id);
    loading = true;
    fetch(DOMAIN + "/tagPerson", {
      method: "POST",
      body: data,
    }).then((response) => {
      if (!response.ok) {
        //  use a notification to display error/failure
        throw new Error("Error occured");
      } else {
        // use a notification to display success.
        $peopleListStore = $peopleListStore.map((item) => {
          if (item === old_person_id) {
            return new_person_id;
          }
          return item;
        });
        loading = false;
        formModal = false;
        const updateIndex = $imagesDataStore["meta_data"].findIndex((item) => {
          return item.absolute_path === imageCard.absolute_path;
        });
        $imagesDataStore["meta_data"][updateIndex].person =
          imageCard.person.map((item) =>
            item === old_person_id ? new_person_id : item
          );
        imageCard.person = imageCard.person.map((item) =>
          item === old_person_id ? new_person_id : item
        );

        alert("Success");
      }
    });
  }

  let loading = false;
  let showFaceDetection = false;
  let photoDetailsModal = false;
  let filterModal = false;
  let imageLoading = false;

  let filterFormData = {
    startDate: null,
    endDate: null,
  };

  function handleFilterSubmit(event) {
    console.log(filterFormData)
  }

  function handlekeydown(event) {
    if (!imageModal) return;
    if (event.key === "ArrowRight") {
      loadNextImage(modalImageIndex + 1);
    } else if (event.key === "ArrowLeft") {
      loadPrevImage(modalImageIndex - 1);
    }
  }
</script>

<Modal bind:open={photoDetailsModal} size="md">
  <PhotoDetail photoDetails={imageCard} />
</Modal>

<Modal
  bodyClass="p-4 md:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain min-h-[75vh]"
  bind:open={filterModal}
  size="md"
  autoclose={false}
  class="w-full"
>
  <form
    on:submit={handleFilterSubmit}
    id="filterForm"
    class="flex flex-col space-y-6"
    action="#"
  >
    <div class="grid grid-cols-2 gap-2">
      <Label class="space-y-2">
        <span>Start Date</span>
        <Input
          type="date"
          bind:value={filterFormData.startDate}
          class="w-full border border-gray-300 p-2 rounded-md"
        />
      </Label>
      <Label class="space-y-2">
        <span>End Date</span>
        <Input
          type="date"
          bind:value={filterFormData.endDate}
          class="w-full border border-gray-300 p-2 rounded-md"
        />
      </Label>
    </div>

    <button
      type="submit"
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
    >
      
        Filter
      
    </button>
  </form>
</Modal>

<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full">
  <form
    on:submit={handleImageSubmit}
    id="imageForm"
    class="flex flex-col space-y-6"
    action="#"
  >
    <Label class="space-y-2">
      <span>Name</span>
      <Input
        value={imageCard.person[current_box_ix]}
        type="name"
        name="name"
        placeholder="Akshay..."
        autocomplete
        required
      />
    </Label>

    <button
      type="submit"
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
    >
      {#if loading}
        <Spinner color="white" size="4" />
      {:else}
        Save
      {/if}
    </button>
    <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
      <a
        href={"/search?person=" + imageCard.person[current_box_ix]}
        class="text-primary-700 hover:underline dark:text-primary-500"
      >
        See all pictures
      </a>
    </div>
  </form>
</Modal>

<div bind:this={imageModalContainer} class="flex justify-center items-center">
  {#if imageModal}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="fixed z-10 bg-black inset-0">
      <!-- {#if imageLoading}
        <TopLoading />
      {/if} -->
      <div
        bind:this={imageview}
        class="w-full h-full items-center flex justify-center"
      >
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img
          on:load={(event) => {
            scale_face_bboxes(event);
            // imageLoading = false;
          }}
          class="w-auto h-full shadow-xl cursor-pointer"
          src={DOMAIN + "/getRawDataFull/" + modalimagehash}
          alt="image"
        />
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <!-- <img
          on:load={(event) => {
            scale_face_bboxes(event);
          }}
          class=" {!imageLoading
            ? 'w-0 h-0'
            : 'w-auto h-full'} shadow-xl cursor-pointer"
          src={DOMAIN + "/getRawData/" + modalimagehash}
          alt="image"
        /> -->

        {#if showFaceDetection}
          <!-- TODO: calculate scale -->
          {#each scaled_face_bboxes as box, i}
            <!-- svelte-ignore missing-declaration -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              on:click={(e) => {
                tag_interface = {
                  active: true,
                  top: box.top - 28,
                  left: box.left,
                };
                current_box_ix = Number(e.target.attributes["data-ix"].value);
                console.log("current_box_ix", current_box_ix);
                // if (imageCard.person instanceof Object){
                //   window.open("/search?person=" + imageCard.person[current_box_ix])
                // }
                formModal = true;
              }}
              data-ix={i}
              class="absolute text-white cursor-pointer border-solid border-2 border-white hover:opacity-40 hover:bg-green-300 bg-transparent"
              style="top: {box.top}px ; left: {box.left}px; width: {box.width}px; height: {box.height}px"
            ></div>
            <Tooltip>{imageCard.person[i]}</Tooltip>
          {/each}
        {/if}

        <!-- <div class="absolute flex justify-center bottom-0">
          <div class="flex gap-4">
            {#if typeof imageCard.person === "string"}
              {#if imageCard.person !== "no person detected"}
                <a
                  target="_blank"
                  href={"/search?person=" + imageCard.person}
                  class="flex items-center"
                >
                  <img
                    loading="lazy"
                    src={DOMAIN + "/getPreviewPerson/" + imageCard.person}
                    class="object-strech border-2 rounded-lg w-24 h-24 bg-gray-800 border-gray-100 shadow-smr"
                    alt=""
                  />
                </a>
              {/if}
            {:else}
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
                      class="object-strech border-2 rounded-lg w-24 h-24 bg-gray-800 border-gray-100 shadow-smr"
                      alt=""
                    />
                  </a>
                {/if}
              {/each}
            {/if}
          </div>
        </div> -->

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

        <button
          on:click={() => {
            showFaceDetection = false;
            imageModal = false;
          }}
          class="absolute top-9 right-6 z-10 flex justify-center items-center -mt-5 w-10 h-10 bg-gray-800 text-white rounded-full focus:outline-none rounded w-8 h-8 flex items-center justify-center bg-gray-800 focus:outline-none"
        >
          <i class="fa fa-xmark"></i>
        </button>
        <Tooltip>Close</Tooltip>

        <!-- Add icons for fullscreen, edit, open in file, favorite -->
        <div class="absolute inset-x-0 top-4 flex justify-center space-x-4">
          <button
            on:click={() => {
              photoDetailsModal = true;
            }}
            class="rounded w-8 h-8 flex items-center justify-center bg-gray-800 focus:outline-none"
          >
            <EditOutline />
          </button>
          <Tooltip>Details</Tooltip>
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
              showFaceDetection = !showFaceDetection;
            }}
            class="rounded {showFaceDetection
              ? 'bg-yellow-500'
              : ''} w-8 h-8 flex items-center justify-center bg-gray-800 focus:outline-none"
          >
            <i class="fa fa-face-smile"></i>
          </button>
          <Tooltip>Face Detection</Tooltip>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex justify-between my-4">
  {#if !isSearch}
    <div
      on:click={() => {
        sortDescending = !sortDescending;
        images_data = sortImageDataByDate(images_data, sortDescending);
      }}
      class="flex cursor-pointer items-center gap-2 text-white hover:text-gray-400 text-base font-medium p-2 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition duration-300 ease-in-out"
    >
      <span>Sort</span>
      <i class="fa fa-sort ml-2"></i>
    </div>
  {/if}
  <!-- <div
    on:click={() => {
      filterModal = true;
    }}
  >
    <button>Filter <i class="fa fa-filter"></i></button>
  </div> -->
</div>

<div class="">
  <div class="flex justify-space-between gap-1 flex-wrap mx-auto">
    <InfiniteScroll loadMoreFunction={loadMoreImages} threshold={100}>
      {#each images_data.scoreIndex.slice(0, imagesloadedcount) as scoreindex, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={() => onImageModalClick(index)}
          class="flex bg-gray-900 justify-center rounded items-center"
        >
          <div class="relative overflow-hidden rounded shadow-md">
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img
              loading="lazy"
              class="w-[19vw] h-[19vw] shadow-xl cursor-pointer transform transition-transform duration-500 hover:scale-110"
              src={DOMAIN +
                "/getRawData/" +
                images_data["data_hash"][scoreindex.ix]}
              alt="image"
            />
            <!-- Add like icon at the bottom -->
            <div
              class="absolute items-center justify-between flex bottom-0 left-0 right-0 m-2"
            >
              <div>
                {#if $likedImagesStore["data_hash"].includes(images_data["data_hash"][scoreindex.ix])}
                  <div
                    on:click={(event) => handleImageLike(event, "false", index)}
                    class={"cursor-pointer"}
                  >
                    <HeartSolid color="white" />
                  </div>
                {:else}
                  <div
                    on:click={(event) => handleImageLike(event, "true", index)}
                    class={"cursor-pointer"}
                  >
                    <HeartOutline />
                  </div>
                {/if}
              </div>

              <div>
                {getDateString(
                  parseDate(images_data["meta_data"][scoreindex.ix].taken_at)
                )}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </InfiniteScroll>
  </div>
</div>
