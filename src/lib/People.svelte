<script>
    import {DOMAIN} from "$lib/stores"
    export let people_list
</script>

<!-- Display each value in group as a clickable div, later on click we would use the PHOTOS component -->
<div class="grid grid-cols-5 justify-center items-center gap-2 mb-16  py-2 flex-wrap">
    <!-- A single div element -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#each people_list as person_id}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="flex flex-col justify-center items-center cursor-pointer" on:click={e => {console.log("Person id is", person_id)}}>
                <div>
                    <a href="{'/people/' + person_id}" class="flex items-center w-48 min-h-[200px] rounded bg-gray-800">
                        <img src={DOMAIN + "/getPreviewPerson/" + person_id} class="object-strech  hover:rounded-none rounded  w-full h-full bg-gray-100 border-gray-100 shadow-smr" alt="">
                    </a>
                    <div class="flex text-black my-2 text-md justify-center items-center">
                        {person_id.slice(0, 1).toUpperCase() + person_id.slice(1).toLowerCase()}
                    </div>
                </div>

        </div>
    {/each}
</div>