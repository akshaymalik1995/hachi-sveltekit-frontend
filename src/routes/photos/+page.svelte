<script>
    import {DOMAIN} from "$lib/stores"
    export let data;
    console.log("DATA", data)
    const { directories_data } = data
    let directories = Object.keys(directories_data);
    directories = directories.sort((a, b) => a.length - b.length)
</script>


 
<div class="px-4" >
    <div class="text-center  my-8 text-6xl">Gallery</div>
    
    <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each directories as directory}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="flex flex-col justify-center rounded-lg items-center">
            <div class="relative overflow-hidden rounded-lg shadow-md">
              <!-- svelte-ignore a11y-img-redundant-alt -->
              <a href={`photos/${directory}`}>
                <img
                  loading="lazy"
                  class="w-64 h-64 rounded-lg shadow-xl cursor-pointer"
                  src={DOMAIN +
                    "/getRawData/" +
                    directories_data[directory]["data_hash"][0]}
                  alt="image"
                />
              </a>
            </div>
            <div class="my-1 text-bold">{directory}</div>
          </div>
        {/each}
      </div>

</div>

