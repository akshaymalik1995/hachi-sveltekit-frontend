<script>
    import {DOMAIN} from "$lib/stores"
    export let data;
    console.log("DATA", data)
    const { directories_data } = data
    let directories = Object.keys(directories_data);
    directories = directories.sort((a, b) => a.length - b.length)
</script>


 
<div class="px-4 py-8">
    <div class="flex justify-center gap-2 flex-wrap">
        {#each directories as directory}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="flex w-64 flex-col justify-center rounded items-center">
            <div class="relative overflow-hidden rounded shadow-md">
              <!-- svelte-ignore a11y-img-redundant-alt -->
              <a href={`photos/${directory}`}>
                <img
                  loading="lazy"
                  class="w-64 h-64 rounded shadow-xl cursor-pointer"
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

