<script>
	import { onMount } from "svelte";
	import { DOMAIN, likedImagesStore, calendarImagesStore, directoriesDataStore, imagesDataStore } from "$lib/stores.js";
	import { page } from "$app/stores";
	export const sidebarOpen = true;

	let likedPhotosCount = $likedImagesStore['meta_data'].length;
	let calendarCount = Object.keys($calendarImagesStore).length;
	let albumsCount = Object.keys($directoriesDataStore).length;
	let photosCount = $imagesDataStore['meta_data'].length;

	$: {
		console.log($likedImagesStore);
		menuItemsData["favourites"].count = $likedImagesStore['meta_data'].length;
	}

	const state = {
		sidebarOpen: sidebarOpen,
	};
	const menuItems = ["albums", 'photos', 'search', "calendar", 'favourites', "indexing", "people"];
	const menuItemsData = {
		search: {
			icon: "search",
			path: "/search",
			name: "Search",
			count: "",
		},
		albums: {
			icon: "image",
			path: "/albums",
			name: "Albums",
			count: albumsCount,
		},
		photos: {
			icon: "image",
			path: "/photos",
			name: "Photos",
			count: photosCount,
		},
		favourites: {
			icon: "heart",
			path: "/favourites",
			name: "Favourites",
			count: likedPhotosCount,
		},
		calendar: {
			icon: "calendar",
			path: "/calendar",
			name: "Calendar",
			count: calendarCount,
		},
		indexing: {
			icon: "book-atlas",
			path: "/indexing",
			name: "Index",
			count: "",
		},
		people: {
			icon: "user-tag",
			path: "/people",
			name: "People",
			count: 0,
		}
	};

	let countData;

	function openSidebar() {
		state.sidebarOpen = true;
	}
	function closeSidebar() {
		state.sidebarOpen = false;
	}

	async function updateMetaStats() {
		const response = await fetch(DOMAIN + "/getMetaStats");
		const data = await response.json();
		console.log("DATA FETCHED TO PROVIDE IMAGES COUNT IMAGES");
		menuItemsData.people.count = data.image.unique_people_count;
	}

	onMount(() => {
		updateMetaStats();
	});
</script>

<aside
	class="fixed inset-0 z-30 flex-none h-full w-64 lg:h-auto border-e border-gray-200 dark:border-gray-600 lg:overflow-y-visible lg:pt-16 lg:block hidden"
	aria-label="Sidebar"
>
	<h4 class="sr-only">Main menu</h4>
	<div
		class="overflow-y-auto px-3 pt-20 lg:pt-5 h-full bg-white scrolling-touch max-w-2xs lg:h-[calc(100vh-4rem)] lg:block dark:bg-gray-800 lg:me-0 lg:sticky top-2"
	>
	
		<nav class="divide-y divide-gray-200 dark:divide-gray-700">
			<ul class="pt-2 space-y-2 mb-3">
				{#each menuItems as item, i}
				<li>
					<a href="{menuItemsData[item].path}" class="font-normal flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
						<i class="fa-solid m-2 fa-{menuItemsData[item].icon}"></i>
						<!-- Hiding the names of menu items when sidebar is closed -->
						{#if state.sidebarOpen}
						<div class="flex w-full justify-between">
							<span class="ml-3">{menuItemsData[item].name}</span>
							<span class="px-3 flex text-md text-bold">{menuItemsData[item].count}</span>
						</div>
						{/if}
					</a>
				</li>
				{/each}
			</ul>
		</nav>
	</div>
</aside>
