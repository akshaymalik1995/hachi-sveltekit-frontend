<script>
  import { parseDate } from "$lib/utils";
  export let photoDetails = {};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
</script>

<div class="text-white max-w-4xl mx-auto">
  <h2 class="text-3xl font-bold mb-6 border-b pb-2">
    {photoDetails.filename}
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-6">
      <div>
        <h3 class="text-xl font-semibold mb-3 text-gray-100">
          Photo Information
        </h3>
        <ul class="space-y-2 text-gray-400">
          <li>
            <span class="font-bold">Dimensions:</span>
            {photoDetails.width} x {photoDetails.height}
          </li>
          <li>
            <span class="font-bold">Taken at:</span>
            {parseDate(photoDetails.taken_at).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </li>
          <li>
            <span class="font-bold">Modified at:</span>
            {formatDate(photoDetails.modified_at).toLocaleString()}
          </li>
          <li>
            <span class="font-bold">File type:</span>
            {photoDetails.resource_type}
          </li>
          <li>
            <span class="font-bold">Extension:</span>
            {photoDetails.resource_extension}
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-3 text-gray-100">Camera Details</h3>
        <ul class="space-y-2 text-gray-400">
          <li><span class="font-bold">Make:</span> {photoDetails.make}</li>
          <li><span class="font-bold">Model:</span> {photoDetails.model}</li>
          <li>
            <span class="font-bold">Device:</span>
            {photoDetails.device}
          </li>
        </ul>
      </div>
    </div>

    <div class="space-y-6">
      <div>
        <h3 class="text-xl font-semibold mb-3 text-gray-100">
          Additional Information
        </h3>
        <ul class="space-y-2 text-gray-400">
          <li>
            <span class="font-bold">Location:</span>
            {photoDetails.place}
          </li>
          <li>
            <span class="font-bold">People:</span>
            {typeof photoDetails.person === "string" ? photoDetails.person : photoDetails.person.join(", ")}
          </li>
          <li>
            <span class="font-bold">Is favorite:</span>
            <span
              class={photoDetails.is_favourite
                ? "text-yellow-500"
                : "text-gray-500"}
            >
              {photoDetails.is_favourite ? "★" : "☆"}
            </span>
          </li>
          <li>
            <span class="font-bold">Is indexed:</span>
            <span
              class={photoDetails.is_indexed
                ? "text-green-500"
                : "text-red-500"}
            >
              {photoDetails.is_indexed ? "✓" : "✗"}
            </span>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-3 text-gray-100">
          File Information
        </h3>
        <ul class="space-y-2 text-gray-400">
          <li class="break-all">
            <span class="font-bold">Directory:</span>
            {photoDetails.resource_directory}
          </li>
          <li class="break-all">
            <span class="font-bold">Full path:</span>
            {photoDetails.absolute_path}
          </li>
        </ul>
      </div>
    </div>
  </div>

  {#if photoDetails.description}
    <div class="mt-6">
      <h3 class="text-xl font-semibold mb-3 text-gray-100">Description</h3>
      <p class="text-gray-400">{photoDetails.description}</p>
    </div>
  {/if}

  {#if photoDetails.tags}
    <div class="mt-6">
      <h3 class="text-xl font-semibold mb-3 text-gray-100">Tags</h3>
      <div class="flex flex-wrap gap-2">
        {#each photoDetails.tags.split(",") as tag}
          <span
            class="bg-blue-100 text-blue-800 text-sm font-bold px-2.5 py-0.5 rounded"
            >{tag.trim()}</span
          >
        {/each}
      </div>
    </div>
  {/if}

  <!-- {#if photoDetails.albums}
    <div class="mt-6">
      <h3 class="text-xl font-semibold mb-3 text-gray-100">Albums</h3>
      <ul class="list-disc list-inside text-gray-400">
        {#each photoDetails.albums as album}
          <li>{album}</li>
        {/each}
      </ul>
    </div>
  {/if} -->
</div>
