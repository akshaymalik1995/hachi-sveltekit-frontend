<script>
    
    import {DOMAIN} from "$lib/stores"
    export let data;
    const { image_data, directories_data } = data;
    const directories = Object.keys(directories_data)

</script>

<div>
   
    
   
    <div class="text-center my-8 text-6xl">Gallary</div>
    <!-- I want to display directories as folders -->

    <div class='grid md:grid-cols-3 xl:grid-cols-6 gap-8'>
        {#each directories as d}
        <a href="{'/photos/' + encodeURIComponent(d) }" class='flex gap-2 flex-col  bg-blue-300 cursor-pointer hover:bg-blue-200 py-4 px-4 rounded'>
            <!-- svelte-ignore a11y-img-redundant-alt -->
            <img
            class="h-48 rounded-lg shadow-xl cursor-pointer"
            src={DOMAIN + "/getRawData/" + directories_data[d].list_dataHash[0]}
            alt="image"
          />
          <div class="text-center">{d}</div>
        </a>
       
        {/each}
    </div>
    

</div>
