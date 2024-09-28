<script>
    import Photos from '../../lib/photos.svelte';
    export let data;
    console.log("DATA", data)
    const { directories_data } = data
    let directories = Object.keys(directories_data);
    let selectedDirectory = directories[0];
    let filteredImages = [];

    function filterImagesByDirectory(dir) {
        filteredImages = structuredClone(directories_data[dir]);
    }

    filterImagesByDirectory(selectedDirectory)

    function convertPathString(path) {
        // Remove any trailing slashes (both backslash and forward slash)
        path = path.replace(/[\/\\]+$/, '');
        path = path.split('\\').join(' > ');
        // Replace all backslashes with ' > '
        return path
    }

</script>


<div class="px-4" >
    <div class="text-center  my-8 text-6xl">Gallery</div>
    <!-- I want to display directories as folders -->
  
    <div class="directory-selector mb-8">
        <select bind:value={selectedDirectory} on:change={() => filterImagesByDirectory(selectedDirectory)} class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {#each directories as dir , index}
                <option value={dir} class="text-gray-600">{convertPathString(dir)}</option>
            {/each}
        </select>
    </div>

    <Photos images_data = {filteredImages} />

</div>
