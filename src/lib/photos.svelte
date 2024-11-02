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
    MonthNames,
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
    parsePersonList,
  } from "$lib/utils";
  import PhotoDetail from "./PhotoDetail.svelte";
  import TopLoading from "./TopLoading.svelte";
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  console.log("people", $peopleListStore);
  export let sortDescending = true;
  export let images_data;
  let filtered_images_data = structuredClone(
    sortImageDataByDate(images_data, sortDescending)
  );
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
    console.log("DATA CHANGES");
    if (!isSearch) {
      filtered_images_data = sortImageDataByDate(
        filtered_images_data,
        sortDescending
      );
    } else {
      console.log("Resetting images data");
      filtered_images_data = structuredClone(filterImages(images_data));
    }
  }

  let imagesloadedcount = 50;
  let filterOn = false;
  let imageModal = false;

  let imageCard = {};

  function getImageMetaData(index) {
    const { ix } = filtered_images_data.scoreIndex[index];
    return images_data.meta_data[ix];
  }

  function getImageData(index) {
    const { ix } = filtered_images_data.scoreIndex[index];
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
    const { ix } = filtered_images_data.scoreIndex[index];
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
    let old_person_id = parsePersonList(imageCard.person)[current_box_ix];

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
        parsePersonList(imageCard.person).map((item) =>
            item === old_person_id ? new_person_id : item
          );
        imageCard.person = parsePersonList(imageCard.person).map((item) =>
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
    day: null,
    month: null,
    year: null,
    person: null,
  };

  function filterImages(images_data) {
    const selectedmonth = filterFormData.month;
    const selectedmonthindex = MonthNames.indexOf(selectedmonth);
    const selectedday = filterFormData.day;
    const selectedyear = filterFormData.year;
    const selectedperson = filterFormData.person;
    if (!filterOn) return images_data;
    filtered_images_data.scoreIndex = images_data.scoreIndex.filter(
      (scoreIndex) => {
        let monthmatched = true;
        let daymatched = true;
        let yearmatched = true;
        let personmatched = true;
        const ix = scoreIndex.ix;
        const metadata = images_data.meta_data[ix];
        const metadatadate = parseDate(metadata);
        if (selectedperson) {
          personmatched = metadata.person.includes(selectedperson);
        }
        if (selectedmonth) {
          monthmatched = metadatadate.getMonth() === +selectedmonthindex;
        }

        if (selectedday) {
          daymatched = metadatadate.getDate() === +selectedday;
        }

        if (selectedyear) {
          yearmatched = metadatadate.getFullYear() === +selectedyear;
        }
        filterModal = false;
        return monthmatched && daymatched && yearmatched && personmatched;
      }
    );
    return filtered_images_data;
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    filterOn = true;
    filterImages(images_data);
  }

  function handlekeydown(event) {
    if (!imageModal) return;
    if (event.key === "ArrowRight") {
      loadNextImage(modalImageIndex + 1);
    } else if (event.key === "ArrowLeft") {
      loadPrevImage(modalImageIndex - 1);
    }
  }

  function clearFilters() {
    filterFormData.day = null;
    filterFormData.month = null;
    filterFormData.year = null;
    filterFormData.person = null;
    filtered_images_data = structuredClone(images_data);
    filterOn = false;
  }

  function dismissAllModals() {
    formModal = false;
    filterModal = false;
    photoDetailsModal = false;
    imageModalContainer = false;
    imageModal = false;
  }

  $: {
    if (imageModal){
      // disable scroll on body
      document.body.style.overflow = "hidden";
    } else {
      // enable scroll on body
      document.body.style.overflow = "auto";
    }
  }
</script>

<Modal dialogClass='fixed inset-0 h-modal md:inset-0 md:h-full z-50 w-full p-4 flex' placement="center" title={imageCard.filename} bind:open={photoDetailsModal} size="md" class="bg-white z-50 dark:bg-gray-800 text-gray-900 overflow-auto dark:text-gray-100">
  <PhotoDetail photoDetails={imageCard} />
</Modal>

<Modal
dialogClass='fixed inset-0 h-modal md:inset-0 md:h-full z-50 w-full p-4 flex'
  placement="center"
  title="Filter Images"
  bodyClass="p-4 md:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain"
  bind:open={filterModal}
  size="md"
  autoclose={false}
  class="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
>
  <form
    on:submit={handleFilterSubmit}
    id="filterForm"
    class="flex flex-col space-y-6"
  >
    <div class="grid grid-cols-3 gap-2">
      <Label class="space-y-2">
        <span>Day</span>
        <select
          bind:value={filterFormData.day}
          class="w-full text-gray-900 dark:text-gray-100 border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 p-2 rounded-md"
        >
          {#each Array.from({ length: 31 }, (_, i) => i + 1) as day}
            <option>{day}</option>
          {/each}
        </select>
      </Label>
      <Label class="space-y-2">
        <span>Month</span>
        <select
          bind:value={filterFormData.month}
          class="w-full text-gray-900 dark:text-gray-100 border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 p-2 rounded-md"
        >
          {#each MonthNames as month}
            <option value={month}>{month}</option>
          {/each}
        </select>
      </Label>
      <Label class="space-y-2">
        <span>Year</span>
        <select
          bind:value={filterFormData.year}
          class="w-full text-gray-900 dark:text-gray-100 border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 p-2 rounded-md"
        >
          {#each Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i) as year}
            <option>{year}</option>
          {/each}
        </select>
      </Label>
    </div>

    <Label class="space-y-2">
      <span>Person</span>
      <select
        bind:value={filterFormData.person}
        class="w-full text-gray-900 dark:text-gray-100 border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 p-2 rounded-md"
      >
        {#each $peopleListStore as person}
          {#if !person.startsWith("no") && !person.startsWith("id")}
            <option>{person}</option>
          {/if}
        {/each}
      </select>
    </Label>

    <div class="grid grid-cols-1 gap-4">
      <button
        type="submit"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Filter
      </button>
    </div>
  </form>
</Modal>

<Modal dialogClass='fixed inset-0 h-modal md:inset-0 md:h-full z-50 w-full p-4 flex' bind:open={formModal} size="xs" autoclose={false} class="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  <form
    on:submit={handleImageSubmit}
    id="imageForm"
    class="flex flex-col space-y-6"
    action="#"
  >
    <Label class="space-y-2">
      <span>Name</span>
      <Input
        value={parsePersonList(imageCard.person)[current_box_ix]}
        type="name"
        name="name"
        placeholder="Akshay..."
        autocomplete
        required
        class="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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
        href={"/people/" +
          (parsePersonList(imageCard.person)[current_box_ix])}
        class="text-primary-700 hover:underline dark:text-primary-500"
      >
        See all pictures
      </a>
    </div>
  </form>
</Modal>

<div bind:this={imageModalContainer} class="flex justify-center items-center">
  {#if imageModal}
    <div class="fixed z-40 bg-black inset-0">
      <div
        bind:this={imageview}
        class="w-full h-full items-center flex justify-center"
      >
        <img
          on:load={(event) => {
            if (event.target.src.includes("/getRawDataFull/")) return;
            scale_face_bboxes(event);
            event.target.src = DOMAIN + "/getRawDataFull/" + modalimagehash;
          }}
          on:error={(event) => {
            if (event.target.src.includes("/getRawDataFull/")) {
              event.target.src = DOMAIN + "/getRawData/" + modalimagehash;
            }
          }}
          class="w-auto h-full max-h-[100vw] shadow-xl cursor-pointer"
          src={DOMAIN + "/getRawData/" + modalimagehash}
          alt="image"
        />

        {#if showFaceDetection}
          {#each scaled_face_bboxes as box, i}
            <div
              on:click={(e) => {
                tag_interface = {
                  active: true,
                  top: box.top - 28,
                  left: box.left,
                };
                current_box_ix = Number(e.target.attributes["data-ix"].value);
                formModal = true;
              }}
              data-ix={i}
              class="absolute text-white cursor-pointer border-solid border-2 border-white hover:opacity-40 hover:bg-green-300 bg-transparent"
              style="top: {box.top}px ; left: {box.left}px; width: {box.width}px; height: {box.height}px"
            ></div>
            <Tooltip>{parsePersonList(imageCard.person)[i]}</Tooltip>
          {/each}
        {/if}

        {#if showFaceDetection}
        <div class="absolute flex justify-center bottom-0">
          <div class="flex overflow-auto gap-4">
            {#if typeof imageCard.person === "string"}
              {#if imageCard.person !== "no_person_detected" && imageCard.person !== "no-categorical-info"}
                <img
                  on:click={() => {
                    dismissAllModals();
                    goto("/search?person=" + person);
                  }}
                  loading="lazy"
                  src={DOMAIN + "/getPreviewPerson/" + imageCard.person}
                  class="object-strech cursor-pointer border-2 rounded-lg w-24 h-24 bg-gray-800 border-gray-100 shadow-sm"
                  alt="{imageCard.person}"
                />
              {/if}
            {:else}
              {#each imageCard.person as person}
                {#if person !== "no_person_detected" && person !== "no-categorical-info"}
                  <img
                    on:click={() => {
                      dismissAllModals();
                      goto("/search?person=" + person);
                    }}
                    loading="lazy"
                    src={DOMAIN + "/getPreviewPerson/" + person}
                    class="object-strech cursor-pointer border-2 rounded-lg w-24 h-24 bg-gray-800 border-gray-100 shadow-sm"
                    alt="{person}"
                  />
                {/if}
              {/each}
            {/if}
          </div>
        </div>
        {/if}

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
          class="absolute top-9 right-6 z-10 flex justify-center items-center -mt-5 w-10 h-10 bg-gray-800 text-white rounded-full focus:outline-none"
        >
          <i class="fa fa-xmark"></i>
        </button>
        <Tooltip>Close</Tooltip>

        <div class="absolute inset-x-0 top-4 flex justify-center space-x-4">
          <button
            on:click={() => {
              photoDetailsModal = true;
            }}
            class="rounded w-8 h-8 text-white flex items-center justify-center bg-gray-800 focus:outline-none"
          >
            <EditOutline />
          </button>
          <Tooltip>Details</Tooltip>
          <button
            on:click={() => {
              imageview.requestFullscreen();
            }}
            class="rounded w-8 h-8 text-white items-center justify-center bg-gray-800 focus:outline-none"
          >
            <div><ZoomInSolid /></div>
          </button>
          <Tooltip>Fullscreen</Tooltip>
          <button
            on:click={() => {
              showFaceDetection = !showFaceDetection;
            }}
            class="rounded {showFaceDetection ? 'bg-yellow-500' : ''} w-8 h-8 text-white flex items-center justify-center bg-gray-800 focus:outline-none"
          >
            <i class="fa fa-face-smile"></i>
          </button>
          <Tooltip>Face Detection</Tooltip>
        </div>
      </div>
    </div>
  {/if}
</div>

{#if filtered_images_data.scoreIndex.length !== 0}
  <div class="flex justify-between items-center my-4">
    <div class="flex items-center gap-2">
      <div
        class="flex cursor-pointer items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-400 text-sm p-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out"
        on:click={() => {
          filterModal = true;
        }}
      >
        <button>Filter <i class="fa fa-filter ml-2"></i></button>
      </div>
      {#if Object.values(filterFormData).filter((item) => item).length && filterOn}
        {#each Object.entries(filterFormData) as [key, value]}
          {#if value}
            <div
              class="flex items-center gap-2 text-gray-900 dark:text-gray-100 text-sm p-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out"
            >
              <span><span class="text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</span> <span>{value}</span></span>
              <button
                class="text-gray-900 dark:text-gray-100 text-sm rounded"
                on:click={() => {
                  filterFormData[key] = null;
                  filtered_images_data = structuredClone(
                    filterImages(images_data)
                  );
                  if (Object.values(filterFormData).filter((item) => item).length === 0) {
                    filterOn = false;
                  }
                }}
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
          {/if}
        {/each}
        <div>
          <button
            class="ml-2 bg-gray-100 dark:bg-gray-700 transition duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm py-2 px-2 rounded"
            on:click={clearFilters}
          >
            Clear All
          </button>
        </div>
      {/if}
    </div>
  
    {#if !isSearch}
      <div
        on:click={() => {
          sortDescending = !sortDescending;
          images_data = sortImageDataByDate(images_data, sortDescending);
        }}
        class="flex cursor-pointer items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-400 text-sm text-xs p-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out"
      >
        <span>Sort</span>
        <i class="fa fa-sort ml-2"></i>
      </div>
    {/if}
  </div>
  
  <div class="">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mx-auto">
      <InfiniteScroll loadMoreFunction={loadMoreImages} threshold={100}>
        {#each filtered_images_data.scoreIndex.slice(0, imagesloadedcount) as scoreindex, index}
          <div
            on:click={() => onImageModalClick(index)}
            class="flex bg-gray-100 dark:bg-gray-700 rounded-lg shadow-xl justify-center items-center"
          >
            <div class="relative rounded-lg overflow-hidden shadow-md">
              <img
                loading="lazy"
                class="lg:w-64 bg-gray-100 dark:bg-gray-700 lg:h-64 cursor-pointer transform transition-transform duration-500 hover:scale-110"
                src={DOMAIN +
                  "/getRawData/" +
                  images_data["data_hash"][scoreindex.ix]}
                alt="image"
              />
              <div
                class="absolute items-center justify-between flex bottom-0 left-0 right-0 m-2"
              >
                <div>
                  {#if $likedImagesStore["data_hash"].includes(images_data["data_hash"][scoreindex.ix])}
                    <div
                      on:click={(event) => handleImageLike(event, "false", index)}
                      class={"text-white cursor-pointer"}
                    >
                      <HeartSolid color="white" />
                    </div>
                  {:else}
                    <div
                      on:click={(event) => handleImageLike(event, "true", index)}
                      class={"text-white cursor-pointer"}
                    >
                      <HeartOutline />
                    </div>
                  {/if}
                </div>
  
                <div class="text-white text-xs sm:text-sm lg:text-base">
                  {getDateString(
                    parseDate(images_data["meta_data"][scoreindex.ix])
                  )}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </InfiniteScroll>
    </div>
  </div>
{/if}
