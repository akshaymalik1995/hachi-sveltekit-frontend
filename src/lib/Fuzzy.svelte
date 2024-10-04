<script>
    import { createEventDispatcher } from "svelte";
    import { DOMAIN } from "$lib/stores";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    const dispatch = createEventDispatcher();
    let selectedOption = "query"; // By default, the selected option for search will be 'query'. The other options are people, place, filename
    let inputElement; // The input element for search is bound to this variable
    let queryButton; // The submit query button is bound to this variable
    export let query_button_disabled; // This is to used to keep track of when to disable the queryButton and when not. The idea is that when until the search is finished we should keep the query button disable
    let finalQuery = ""; // To store the final query that will be created using all the filters
    let dropdownItems = []; // Search suggestions
    let selectedFilters = {
        // To store the different search queries
        person: [],
        query: [],
        place: [],
        filename: [],
    };

    const currentUrl = $page.url;

    // fetchFiltersFromUrl looks at the current url, extract the search params and store them into the selectedFilters. The idea is that when a user have a search url, he should be able to see the selectedFilters
    function fetchFiltersFromUrl() {
        const currentUrl = $page.url; // Get the current url
        for (let key of Object.keys(selectedFilters)) {
            // Loop through the filter options
            if (currentUrl.searchParams.get(key)) {
                // Check if the option is in the searchParams
                const values = currentUrl.searchParams.get(key).split("?"); // If it is, it could be in the form "value1?value2". We turn it into a list of values such as ['value1', 'value2']
                for (let v of values) {
                    // Looping through the values
                    selectedFilters[key] = [...selectedFilters[key], v]; // Pushing the values to the approprtiate filter option
                }
            }
        }
    }

    fetchFiltersFromUrl();

    let valueInput = ""; // To store the value of the search input on change
    let showDropdown = false; // To manage the state of the search suggestions dropdown

    // getSuggestion get suggestions from the server. The two parameters are: 1. attribute - which might be option values such as people, place,  2. query : which will be the value of a given option. The function is executed every time the value of search input changes
    async function getSuggestion(selectedOption, query) {
        let url = "/getSuggestion"; // Creating the URL
        let data = new FormData(); // Initializing the form data object
        data.append("attribute", selectedOption); // Appending attribute
        data.append("query", query); // Appending query
        let response = await fetch(DOMAIN + url, {
            // Sending the request and wait for the response
            method: "POST",
            body: data,
        });
        if (response.ok === true) {
            // If the response is okay, we return the returned json data
            return await response.json();
        } else {
            return {};
        }
    }

    async function handleValueChange(e) {
        // based of the current value in the Input (search), and current selected attribute, we try to give suggestions.
        if (valueInput.length === 0) {
            // We do not execute it any further if the search input is empty
            return;
        }
        // update the dropDown items, based on the current query aka valueInput for an image attribute,
        let result = await getSuggestion(selectedOption, valueInput);
        if (selectedOption in result) {
            dropdownItems = result[selectedOption];
            showDropdown = true;
        } else {
            dropdownItems = [];
            showDropdown = false;
        }
    }

    function clearFilter(target, option) {
        selectedFilters[option] = [];
        if (selectedOption == option) {
            dropdownItems = [];
        }
    }

    function handleListItemClick(selectedOption, item) {
        showDropdown = false;
        valueInput = item; // Update inputValue with clicked item's value
        inputElement.focus();
    }

    function handleOptionChange(option) {
        selectedOption = option;
        dropdownItems = selectedFilters[selectedOption]; // set dropdown items to recent searches for that attribute.
        showDropdown = true;
        inputElement.focus();
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        await caches.delete(caches.keys())
        showDropdown = false; // Closing off the dropdown
        console.debug("SELECTED FILTERS", selectedFilters);
        if (
            valueInput.length > 0 &&
            !selectedFilters[selectedOption].includes(valueInput)
        ) {
            selectedFilters[selectedOption] = [
                ...selectedFilters[selectedOption],
                valueInput,
            ];
        }

        valueInput = "";
        let temp_keys = Object.keys(selectedFilters); // ['person', 'query', ...]
        finalQuery = "";
        for (let key of temp_keys){
            if (selectedFilters[key].length > 0) {
                if (finalQuery !== ""){
                finalQuery += "&"
            }
                finalQuery += key + "=" + selectedFilters[key].join("?")
            }
            
        }
        
        dispatch('queryReady', { query : finalQuery})
        goto("/search")
    }
</script>

<div class="w-full p-4 mx-auto">
    <div class="w-full relative place-content-center">
        <!-- A select input -->
        <form class="w-full" on:submit={handleFormSubmit} action="">
            <div class="flex w-full items-center my-2 flex-wrap">
                {#each Object.keys(selectedFilters) as option}
                    {#if selectedFilters[option].length >= 1}
                        <div
                            class="self-center bg-white px-4 py-2 rounded-md inline-flex place-self-center items-center mr-2 mb-2"
                        >
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div
                                on:click={() => handleOptionChange(option)}
                                class="cursor-pointer"
                            >
                                <span class="text-blue-800">
                                    {option.charAt(0).toUpperCase() +
                                        option.slice(1)}
                                </span>
                                {#each selectedFilters[option] as value}
                                    <span class="ml-1 p-2 ">{value + " "}</span>
                                {/each}
                            </div>
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div
                                class="ml-4  text-red-600 cursor-pointer hover:text-blue-500"
                                on:click={(e) =>
                                    clearFilter(e.currentTarget, option)}
                            >
                                x
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>

            <div class="flex space-x-2">
                <select
                    on:change={(e) => handleOptionChange(e.target.value)}
                    class="px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                    name="select-option"
                    id="select-option"
                    bind:value={selectedOption}
                >
                    <!--  Code to display all possible options as attributes in a select element as parent. -->
                    {#each Object.keys(selectedFilters) as option}
                        <option value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                    {/each}
                </select>

                <div class="grow bg-blue-200 rounded-md h-10">
                    <input
                        bind:this={inputElement}
                        bind:value={valueInput}
                        on:input={handleValueChange}
                        class="px-4 py-4 border rounded-md focus:outline-none h-full w-full"
                        type="search"
                        placeholder="Enter value here"
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

        <!-- Menu options list -->
        {#if dropdownItems.length > 0}
            <div
                class="{!showDropdown
                    ? 'hidden'
                    : ''} w-full bg-white border rounded-md shadow-md mt-1"
            >
                <ul class="divide-y max-h-36 overflow-y-auto divide-gray-200">
                    {#each dropdownItems as item}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <li
                            on:click={() =>
                                handleListItemClick(selectedOption, item)}
                            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {item}
                        </li>
                    {/each}
                </ul>
                <div class="flex w-full justify-center items-center">
                    <button
                        class="w-full bg-gray-300 border text-gray-900 hover:bg-gray-500 hover:text-gray-100 py-1 px-4 shadow-md"
                        on:click={() => (showDropdown = false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>
