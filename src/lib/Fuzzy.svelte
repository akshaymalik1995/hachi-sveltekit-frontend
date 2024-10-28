<script>
    import { createEventDispatcher } from "svelte";
    import { DOMAIN } from "$lib/stores";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    const dispatch = createEventDispatcher();
    let valueInput = ""; // To store the value of the search input on change

    let inputElement; // The input element for search is bound to this variable
    let queryButton; // The submit query button is bound to this variable
    export let query_button_disabled; // This is to used to keep track of when to disable the queryButton and when not. The idea is that when until the search is finished we should keep the query button disable
    let finalQuery = ""; // To store the final query that will be created using all the filters

    function fetchFiltersFromUrl(url = $page.url) {
        const currentUrl = url // Get the current url
        const searchParams = currentUrl.searchParams; // Get the searchParams from the url
        const person = searchParams.get("person"); // Get the person from the searchParams
        const query = searchParams.get("query"); // Get the query from the searchParams
        if (person || query) {
            valueInput = `${person ? `@${person}` : ""} ${query ? query : ""}`; // Set the value of the search input
        }
        
    }

    $: {
        fetchFiltersFromUrl($page.url);
    }

    fetchFiltersFromUrl();

    

    async function handleValueChange(e) {
        if (valueInput.length === 0) {
            // We do not execute it any further if the search input is empty
            return;
        }
    }


    async function handleFormSubmit(e) {
        e.preventDefault();
        // Extract the value after @ from the input using regex and store it as person
        // For example, if the input is "@akshay mountain", then person will be "akshay" and query will be "mountain"
        const value = valueInput;
        const person = value.match(/@(\w+)/);
        const query = value.replace(/@(\w+)/, "").trim();

        finalQuery = `person=${person ? person[1] : ""}&query=${query}`;

        dispatch("queryReady", { query: finalQuery });
        goto("/search");
    }

</script>

<div class="w-full py-4 mx-auto">
    <div class="w-full relative place-content-center">
        <!-- A select input -->
        <form class="w-full" on:submit={handleFormSubmit} action="">

            <div class="flex space-x-2">
                <div class="grow bg-blue-200 rounded-md h-10">
                    <input
                        bind:this={inputElement}
                        bind:value={valueInput}
                        on:input={handleValueChange}
                        class="px-4 py-4 bg-gray-800 text-white border rounded-md focus:outline-none h-full w-full"
                        type="search"
                        placeholder="Type @username to search by person or enter keywords"
                    />
                </div>

                <div class="flex">
                    <button
                        type="submit"
                        class="bg-blue-600 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold px-4 rounded"
                        bind:this={queryButton}>Search</button
                    >
                </div>
            </div>
        </form>

    </div>
</div>
