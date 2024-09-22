<script>
    import { DOMAIN } from "$lib/stores";
    import { page } from '$app/stores';
    export let data
    const {images_data} = data
    const imagepath= decodeURIComponent($page.params.path) 
    const imagedata = images_data[imagepath]
</script>

<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-img-redundant-alt -->
<div class="w-full h-screen flex justify-center items-center h-full">
    <img class="w-auto h-screen object-cover rounded-lg shadow-xl cursor-pointer" src={DOMAIN + "/getRawDataFull/" + imagedata.hash} alt="image" />
  </div>
