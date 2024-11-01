<script>
  import {DOMAIN} from "$lib/stores"
  export let data;
  console.log("DATA", data)
  const { directories_data } = data
  let directories = Object.keys(directories_data);
  directories = directories.sort((a, b) => a.length - b.length)
</script>

<div class="px-4 py-8">
  <div class="flex justify-center gap-5 flex-wrap">
    {#each directories as directory}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="flex shadow-xl rounded-lg bg-gray-100 dark:bg-gray-900 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex-col">
      <div class="relative rounded-t-lg overflow-hidden">
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <a href={`albums/${directory}`}>
        <img
          loading="lazy"
          class="w-full h-64  cursor-pointer transform transition-transform duration-500 hover:scale-110"
          src={DOMAIN +
          "/getRawData/" +
          directories_data[directory]["data_hash"][0]}
          alt="image"
        />
        </a>
      </div>
      <div class="p-2 rounded-b-lg dark:bg-gray-700 dark:text-white text-center text-bold">{directory}</div>
      </div>
    {/each}
    </div>
</div>
