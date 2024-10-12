<script>
    import {DOMAIN} from "$lib/stores"
    export let data;
    console.log("DATA", data)
    const { directories_data } = data
    let directories = Object.keys(directories_data);
    directories = directories.sort((a, b) => a.length - b.length)
</script>


 
<div class="px-4 py-8">
    <div class="flex justify-center gap-3 flex-wrap">
        {#each directories as directory}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="flex bg-gray-800 w-64 flex-col">
            <div class="relative overflow-hidden shadow-md">
              <!-- svelte-ignore a11y-img-redundant-alt -->
              <a href={`albums/${directory}`}>
                <img
                  loading="lazy"
                  class="w-64 h-64 shadow-xl cursor-pointer transform transition-transform duration-500 hover:scale-110"
                  src={DOMAIN +
                    "/getRawData/" +
                    directories_data[directory]["data_hash"][0]}
                  alt="image"
                />
              </a>
            </div>
            <div class="p-2 bg-yellow-800 text-center text-bold">{directory}</div>
          </div>
        {/each}
      </div>

</div>

