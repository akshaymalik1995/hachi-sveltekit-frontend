<script>
  import Sidebar from "$lib/Sidebar.svelte";
  import {goto} from "$app/navigation";
  import "../app.css";
  import {
    imagesDataStore,
    likedImagesStore,
    calendarImagesStore,
    peopleListStore,
    directoriesDataStore,
    peopleDataStore,
  } from "$lib/stores.js";
  export let data;
  const {
    images_data,
    likedImagesData,
    calendarImagesData,
    people_list,
    directories_data,
    people_data,
  } = data;

  $: {
    $imagesDataStore = images_data;
  }

  $: {
    $likedImagesStore = likedImagesData;
  }

  $: {
    $calendarImagesStore = calendarImagesData;
  }
  $: {
    $peopleListStore = people_list;
  }
  $: {
    $directoriesDataStore = directories_data;
  }
  $: {
    $peopleDataStore = people_data;
  }

  let searchInput = "";

  async function handleFormSubmit(e) {
        e.preventDefault();
        // Extract the values after @ from the input using regex and store them as persons
        // For example, if the input is "@akshay mountain", then persons will be ["akshay"] and query will be "mountain"
        // The persons should be a list to allow for multiple people to be searched
        // For example, "@akshay @john mountain" will be split into persons = ["akshay", "john"] and query = "mountain"
        const value = searchInput.trim();
        const persons = [...value.matchAll(/@(\w+)/g)].map(match => match[1]);
        const query = value.replace(/@\w+/g, "").trim();

        // Multiple values are separated by &
        let finalQuery = `person=${persons.join("?")}&query=${query}`;
        searchInput = "";
        goto("/search?" + finalQuery);
    }

  let innerWidth = window.innerWidth;

  let drawerHidden = window.innerWidth > 1024 ? false : true;

  function toggleDarkMode() {
    console.log("TOGGLE DARK MODE");
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
}

</script>

<header
  class="fixed top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
>
  <nav
    class="bg-white dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 px-2 sm:px-4 py-2.5 w-full text-black"
  >
    <div class="mx-auto flex flex-wrap justify-between items-center w-full">
      <button
        on:click={() => (drawerHidden = !drawerHidden)}
        type="button"
        class="focus:outline-none whitespace-normal rounded-lg focus:ring-2 p-1.5 focus:ring-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 m-0 me-3 md:block lg:hidden"
        aria-label="Open main menu"
      >
        <span class="sr-only">Open main menu</span>
        <i class="fas fa-bars h-6 w-6 shrink-0"></i>
      </button>
      <a href="/" class="flex items-center lg:w-60">
        <!-- <img src="/images/flowbite-svelte-icon-logo.svg" class="me-2.5 h-6 sm:h-8" alt="Flowbite Logo"> -->
        <span
          class="ml-px self-center whitespace-nowrap text-xl font-semibold dark:text-white sm:text-2xl"
          data-svelte-h="svelte-tt5yny">Hachi</span
        >
      </a>
      <div class="hidden lg:block lg:ps-3">
        <form on:submit={handleFormSubmit}>
          <div
            class="flex items-center w-full bg-gray-50 text-gray-900 dark:bg-gray-600 dark:text-white border-gray-300 dark:border-gray-500 text-sm rounded-lg mt-1 border focus-within:ring-primary-500 focus-within:border-primary-500"
          >
            <div
              class="flex items-center text-gray-500 dark:text-gray-400 ps-2.5"
            >
              <i class="fas flex items-center justify-center fa-search w-6 h-6"
              ></i>
            </div>
            <input
              class="block w-full disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right p-2.5 ps-2.5 bg-transparent focus:outline-none"
              placeholder="Search"
              type="search"
              bind:value={searchInput}
            />
          </div>
        </form>
      </div>
      <div
        class="ms-auto flex items-center text-gray-500 dark:text-gray-400 sm:order-2"
      >
        <button
            aria-label="Dark mode"
            type="button"
            class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5"
            on:click={toggleDarkMode}
        >
            <span class="hidden dark:block">
                <i class="fas fa-moon w-5 h-5"></i>
            </span>
            <span class="block dark:hidden">
                <i class="fas fa-sun w-5 h-5"></i>
            </span>
        </button>
      </div>
    </div>
  </nav>
</header>

<div class="overflow-hidden lg:flex">
  <Sidebar drawerHidden={drawerHidden} />
  <!-- <div
    class="fixed inset-0 z-20 bg-gray-900/50 dark:bg-gray-900/60"
    role="presentation"
    hidden=""
  ></div> -->
  <div class="relative h-full w-full overflow-y-auto lg:ml-64 pt-[70px]">
    <main class="p-4">
      <slot></slot>
    </main>
  </div>
</div>
