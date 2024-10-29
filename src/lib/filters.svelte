<script>
    import { onMount, onDestroy } from "svelte";
    import { MonthNames } from "$lib/stores";
    
    export let filterImages;

    let dates = [];
    let months = [];
    let years = [];
    let selectedDates = [];
    let selectedMonths = [];
    let selectedYears = [];
    let showDates = false;
    let showMonths = false;
    let showYears = false;

    onMount(() => {
        dates = Array.from({ length: 31 }, (_, i) => i + 1);
        months = Array.from({ length: 12 }, (_, i) => i);
        years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

        document.addEventListener('click', handleClickOutside);
    });

    onDestroy(() => {
        document.removeEventListener('click', handleClickOutside);
    });

    function toggleSelection(array, value, type) {
        let newArray;
        if (array.includes(value)) {
            newArray = array.filter((item) => item !== value);
        } else {
            newArray = [...array, value];
        }

        if (type === 'dates') {
            selectedDates = newArray;
            showDates = false;
        } else if (type === 'months') {
            selectedMonths = newArray;
            showMonths = false;
        } else if (type === 'years') {
            selectedYears = newArray;
            showYears = false;
        }

        filterImages({
            days: selectedDates,
            months: selectedMonths,
            years: selectedYears
        });

        return newArray;
    }

    function toggleDropdown(type) {
        showDates = type === 'dates' ? !showDates : false;
        showMonths = type === 'months' ? !showMonths : false;
        showYears = type === 'years' ? !showYears : false;
    }

    function handleClickOutside(event) {
        if (!event.target.closest('.dropdown')) {
            showDates = false;
            showMonths = false;
            showYears = false;
        }
    }

    function clearSelections(type) {
        if (type === 'dates') {
            selectedDates = [];
        } else if (type === 'months') {
            selectedMonths = [];
        } else if (type === 'years') {
            selectedYears = [];
        } else {
            selectedDates = [];
            selectedMonths = [];
            selectedYears = [];
        }

        filterImages({
            days: selectedDates,
            months: selectedMonths,
            years: selectedYears
        });
    }
</script>

<div class="flex space-x-4">
    <!-- Date Filter -->
    <div class="relative inline-block dropdown">
        <button
            class="bg-gray-800 text-white px-4 text-sm py-2 rounded flex items-center space-x-2"
            on:click={() => toggleDropdown('dates')}>
            {#if selectedDates.length > 0}
                <span>{selectedDates.join(', ')}</span>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span
                    class="ml-2 bg-red-600 text-white px-2 rounded cursor-pointer"
                    on:click={(event) => {
                        event.stopPropagation();
                        clearSelections("dates");
                    }}>
                    &times;
                </span>
            {:else}
                <span>Select Dates</span>
            {/if}
        </button>
        {#if showDates}
            <div class="absolute z-[100] w-64 grid grid-cols-5 gap-2 bg-gray-800 shadow-lg rounded-md mt-1 p-2">
                {#each dates as date}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="px-4 py-2 {selectedDates.includes(date) ? 'bg-gray-600 rounded' : 'bg-gray-800'} cursor-pointer"
                        on:click={() =>
                            (selectedDates = toggleSelection(selectedDates, date, 'dates'))}>
                        {date}
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Month Filter -->
    <div class="relative inline-block dropdown">
        <button
        class="bg-gray-800 text-white px-4 text-sm py-2 rounded flex items-center space-x-2"
        on:click={() => toggleDropdown('months')}>
        {#if selectedMonths.length > 0}
            <span>{selectedMonths.map((item) => MonthNames[item].slice(0,3)).join(', ')}</span>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span
                class="ml-2 bg-red-600 text-white px-2 rounded cursor-pointer"
                on:click={(event) => {
                    event.stopPropagation();
                    clearSelections("months");

                }}>
                &times;
            </span>
        {:else}
            <span>Select Months</span>
        {/if}
    </button>
        {#if showMonths}
            <div class="absolute z-[100] w-96 grid grid-cols-3 gap-2 bg-gray-800 shadow-lg rounded-md mt-1 p-2">
                {#each months as month}
                 <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="px-4 py-2 cursor-pointer {selectedMonths.includes(month) ? 'bg-gray-600 rounded' : 'bg-gray-800'}"
                        on:click={() =>
                            (selectedMonths = toggleSelection(selectedMonths, month, 'months'))}>
                        {MonthNames[month]}
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Year Filter -->
    <div class="relative inline-block dropdown">
        <button
            class="bg-gray-800 text-white px-4 text-sm py-2 rounded flex items-center space-x-2"
            on:click={() => toggleDropdown('years')}>
            {#if selectedYears.length > 0}
                <span>{selectedYears.join(', ')}</span>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span
                    class="ml-2 bg-red-600 text-white px-2 rounded cursor-pointer"
                    on:click={(event) => {
                        event.stopPropagation();
                        clearSelections("years");
                    }}>
                    &times;
                </span>
            {:else}
                <span>Select Years</span>
            {/if}
        </button>
        {#if showYears}
            <div class="absolute z-[100] w-72 grid grid-cols-4 gap-2 bg-gray-800 shadow-lg rounded-md mt-1 p-2">
                {#each years as year}
                 <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="px-4 py-2 cursor-pointer {selectedYears.includes(year) ? 'bg-gray-600 rounded' : 'bg-gray-800'}"
                        on:click={() =>
                            (selectedYears = toggleSelection(selectedYears, year, 'years'))}>
                        {year}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

