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
        // Split the person by ? to get the list of persons
        let persons = person ? person.split("?") : [];
        const query = searchParams.get("query"); // Get the query from the searchParams
        if (person || query) {
            valueInput = `${person ? persons.map(item => `@${item}`).join(" ") : ""} ${query ? query : ""}`; // Set the value of the search input
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
        // Extract the values after @ from the input using regex and store them as persons
        // For example, if the input is "@akshay mountain", then persons will be ["akshay"] and query will be "mountain"
        // The persons should be a list to allow for multiple people to be searched
        // For example, "@akshay @john mountain" will be split into persons = ["akshay", "john"] and query = "mountain"
        const value = valueInput;
        const persons = [...value.matchAll(/@(\w+)/g)].map(match => match[1]);
        const query = value.replace(/@\w+/g, "").trim();

        // Multiple values are separated by &
        finalQuery = `person=${persons.join("?")}&query=${query}`;

        dispatch("queryReady", { query: finalQuery });
        goto("/search");
    }

</script>

<div class="w-full py-4 mx-auto">
    <div class="w-full relative place-content-center">
        <!-- A select input -->
        <form class="w-full" on:submit={handleFormSubmit} action="">

            <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <div class="grow bg-blue-200 dark:bg-blue-800 rounded-md h-10">
                    <input
                        bind:this={inputElement}
                        bind:value={valueInput}
                        on:input={handleValueChange}
                        class="px-4 py-2 md:py-4 dark:bg-gray-800 bg-gray-100 dark:text-white  border rounded-md focus:outline-none h-full w-full"
                        type="search"
                        placeholder="Type @username to search by person or enter keywords"
                    />
                </div>

                <div class="flex">
                    <button
                        type="submit"
                        class="bg-blue-600 hover:bg-blue-800 disabled:bg-blue-400 dark:bg-blue-400 dark:hover:bg-blue-600 dark:disabled:bg-blue-200 text-white dark:text-black font-semibold px-4 rounded"
                        bind:this={queryButton}>Search</button
                    >
                </div>
            </div>
        </form>

    </div>
</div>
