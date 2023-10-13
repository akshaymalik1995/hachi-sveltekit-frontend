<script>
    import { DOMAIN } from "$lib/stores";
    import {createEventDispatcher} from "svelte"
    import {goto} from "$app/navigation"

    const dispatch = createEventDispatcher()
    async function updatePersonId(node){
        let newpersonId = node.target.value
        let dataHash = imageViewData.dataHash
        let oldPersonId = imageViewData['personIds'][currentBoxIx]
        if (node.key == 'Enter'){
            let data = new FormData()
            data.append("new_person_id", newpersonId)
            data.append("old_person_id", oldPersonId)
            data.append('data_hash', dataHash)

            const response = await fetch(DOMAIN + "/tagPerson", {
                "method" : "POST",
                "body" : data
            })
            if (!response.ok){
                alert("Failed to update person id")
                return
            } 
            alert("Successfully updated person's id")
        }
    }
    export let imageViewData = {}
    let scaledFaceBoxes = []
    let tagInterface = {}
    let currentBoxIx
    let activeFaceId

    
    function scaleFaceBoxes(node){
    
    let cardRects = node.target.getClientRects()[0];
    let cardWidth = cardRects.width;
    let cardHeight = cardRects.height;

    let result = [];
    let originalBoxes = imageViewData.metadata.face_bboxes;
    if (originalBoxes){
        let imageWidth = imageViewData.metadata.width;
        let imageHeight = imageViewData.metadata.height;
        for(let i = 0; i < originalBoxes.length; i++){
            let tempBox = structuredClone(originalBoxes[i]) // [x1, y1, x2, y2]
            let wScale = Number(cardWidth) / (Number(imageWidth) + 1e-4);
            let hScale = Number(cardHeight) / (Number(imageHeight) + 1e-4); 
            tempBox.top = (tempBox[1])*hScale;
            tempBox.height = (tempBox[3] - tempBox[1])*hScale;
            tempBox.left = (tempBox[0])*wScale;
            tempBox.width = (tempBox[2] - tempBox[0])*wScale;
            result.push(tempBox);
        }
    }
    scaledFaceBoxes = result;
  }
</script>

<div
    class="fixed z-20 top-0 left-0 bg-black h-screen w-screen flex justify-center items-center"
>
    <div class="relative flex">
        <img
            on:load={scaleFaceBoxes}
            class="object-cover h-screen w-auto"
            src={DOMAIN + "/getRawDataFull/" + imageViewData.hash}
            alt=""
        />

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        {#each scaledFaceBoxes as box, i}
            <!-- svelte-ignore missing-declaration -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                on:click={(e) => {
                    tagInterface = {
                        active: true,
                        top: box.top - 28,
                        left: box.left,
                    };
                    currentBoxIx = Number(
                        e.target.attributes["data-ix"].value
                    );
                    activeFaceId = imageViewData.personIds[currentBoxIx]
                    
                    
                }}
                data-ix={i}
                class="absolute text-white cursor-pointer border-solid border-2 border-green-300 hover:opacity-40 hover:bg-green-300 bg-transparent"
                style="top: {box.top}px ; left: {box.left}px; width: {box.width}px; height: {box.height}px"
            />
        {/each}
        {#if tagInterface.active}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="absolute rounded flex flex-col h-auto w-240 bg-blue-300" style = "top: {tagInterface.top}px ; left: {tagInterface.left + 50}px;">  
            <input  value = {activeFaceId} class = "flex-none placeholder-gray-800  w-200 text-xl text-black py-2 bg-blue-300 bg-blue-300 border-4" on:keyup={updatePersonId} placeholder="Enter person id" type="text"/>
            <!-- svelte-ignore a11y-missing-content -->
            <a class="bg-gray-600 pointer-cursor hover:bg-gray-700 text-white text-center py-2" target="_blank" href={"/people/" + activeFaceId}>All Photos</a>
            <!-- svelte-ignore missing-declaration -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div on:click={() => {tagInterface.active = false;}} class="grow flex justify-center  absolute w-8 h-8 -right-2 -top-2 bg-red-500 rounded-full text-center text-black hover:bg-blue-500 cursor-pointer text-xl">
            <span>x</span>
            </div>
        </div>
        {/if}
    </div>
    <div class = "absolute  flex mx-auto items-center justify-between w-screen">
        <!-- svelte-ignore missing-declaration -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="text-white rounded bg-gray-700 px-4 py-2 mx-12 cursor-pointer" on:click={() => dispatch("showPreviousImage")}>
            <i class="fa text-4xl fa-arrow-left" />
        </div>
            
        <!-- svelte-ignore missing-declaration -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="text-white rounded bg-gray-700 px-4 py-2 mx-12 cursor-pointer" on:click={() => dispatch("showNextImage")}>
            <i class="fa text-4xl fa-arrow-right" />
        </div>
    </div>
</div>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="fixed z-20 top-5 left-10 flex h-12 items-center justify-between w-screen">
    <!-- svelte-ignore missing-declaration -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="cursor-pointer px-4 py-2 bg-gray-700 rounded hover:underline text-white" on:click={() => dispatch('closeImageView') }>
        <i  class="fa fa-arrow-left mr-1 text-white"></i>
        Back
    </div>
          
    <!--  -->
    <!-- svelte-ignore missing-declaration -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    
</div>
