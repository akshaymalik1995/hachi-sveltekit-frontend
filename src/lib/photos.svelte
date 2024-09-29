<script>
    import { Modal, Tooltip } from "flowbite-svelte";
    import {
        EditOutline,
        ZoomInSolid,
        CloseCircleOutline,
    } from "flowbite-svelte-icons";
    import InfiniteScroll from "./InfiniteScroll.svelte";
    import { DOMAIN } from "$lib/stores";
    export let images_data;
    console.log("IMAGES DATA", images_data);
    
    $: {
        images_data = images_data
    }

    let imagesloadedcount = 20;

    let imageModal = false;


    function loadMoreImages() {
        imagesloadedcount += 20;
    }

    function loadPrevImage(index) {
        modalImageIndex = index;
        modalimagehash = getImageHash(index)
    }

    function loadNextImage(index) {
        modalImageIndex = index;
        modalimagehash = getImageHash(index)
    }

    function getImageHash(index){
        const {ix} = images_data.scoreIndex[index]
        console.log()
        return images_data.data_hash[ix]
    }

    function onImageModalClick(index) {
        modalImageIndex = index;
        imageModal = true;
        modalimagehash = getImageHash(index)
    }

    let imageview;
    let modalimagehash = null;
    let modalImageIndex = null;
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
                class="w-auto h-full shadow-xl cursor-pointer"
                src={DOMAIN + "/getRawDataFull/" + modalimagehash}
                alt="image"
            />

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
            {#each images_data.scoreIndex.slice(0, imagesloadedcount) as scoreindex , index}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    on:click={() => onImageModalClick(index)}
                    class="flex  bg-gray-200 justify-center rounded-lg items-center"
                >
                    <div class="relative overflow-hidden rounded-lg shadow-md">
                        <!-- svelte-ignore a11y-img-redundant-alt -->
                        <img
                            loading="lazy"
                            class="w-full h-48 rounded-lg shadow-xl cursor-pointer"
                            src={DOMAIN +
                                "/getRawData/" + images_data["data_hash"][scoreindex.ix]
                            }
                            alt="image"
                        />
                    </div>
                </div>
            {/each}
        </InfiniteScroll>
    </div>
</div>
