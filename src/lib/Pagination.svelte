
<script>
    export let currentPage
    export let totalPages
    import {page} from "$app/stores"
    let baseURL = $page.url.pathname  + "?page="
    
</script>

<div
class="fixed bg-gray-100 px-12 py-4 w-full bottom-0 z-10"
>
<div class="flex w-full gap-4">
    <a class=' py-2 px-4 bg-blue-300 hover:bg-blue-200 rounded' href={baseURL + Math.max(1, currentPage - 1) }> <i class="fa fa-arrow-left"></i> </a>
    <div class='text-2xl'>
        <form class='inline' action={baseURL}>
            <input class="text-center  py-1 w-16 bg-white rounded focus:outline-none" value={currentPage} name="page" type="text">
        </form>
        <span>/ {totalPages}</span>
    </div>
    <a class='py-2 px-4 hover:bg-blue-200 bg-blue-300 rounded' href={baseURL + Math.min(totalPages, currentPage + 1) } ><i class="fa fa-arrow-right"></i></a>
</div>

</div>