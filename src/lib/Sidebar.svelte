<script>
	import { onMount } from "svelte";
	import {DOMAIN, likedImagesStore, calendarImagesStore, directoriesDataStore} from "$lib/stores.js"
	import {page} from "$app/stores"
	export const sidebarOpen = true;

	let likedPhotosCount = $likedImagesStore['meta_data'].length
	let calendarCount = Object.keys($calendarImagesStore).length
	let albumsCount = Object.keys($directoriesDataStore).length

	$ : {
		console.log($likedImagesStore)
		menuItemsData["favourites"].count = $likedImagesStore['meta_data'].length
	}
	
	const state = {
		sidebarOpen: sidebarOpen,
	};
	const menuItems = ["albums", 'search', "calendar", 'favourites', "indexing", "people" ]
	const menuItemsData = {
		search : {
			icon: "search",
			path: "/search",
			name: "Search",
			count: "",
		},
		albums : {
			icon: "image",
			path: "/albums",
			name: "Albums",
			count: albumsCount,
		},

		favourites : {
			icon: "heart",
			path: "/favourites",
			name: "Favourites",
			count: likedPhotosCount,
		},
		calendar : {
			icon: "calendar",
			path: "/calendar",
			name: "Calendar",
			count: calendarCount,
		},
	
		indexing : {
			icon: "book-atlas",
			path: "/indexing",
			name: "Index",
			count: "",
		},
		people : {
			icon: "user-tag",
			path: "/people",
			name: "People",
			count: 0,
		}
		
	}

	let countData

	function openSidebar() {
			state.sidebarOpen = true;
		}
		function closeSidebar() {
			state.sidebarOpen = false;
		}

		async function updateMetaStats(){
			const response = await fetch(DOMAIN + "/getMetaStats")
			const data = await response.json()
			console.log("DATA FETCHED TO PROVIDE IMAGES COUNT IMAGES")
			menuItemsData.people.count = data.image.unique_people_count
		}

		onMount(()=> {
			updateMetaStats()
		})

		

		

	
</script>


<div class="flex sticky top-0 z-10 h-screen bg-gray-800 text-white">
	<aside  class="{state.sidebarOpen && 'w-64'}">
		<div class="flex h-16 items-center justify-between font-semifold text-white">
			{#if state.sidebarOpen}
			<a href="/" class="px-4 text-3xl">Hachi</a>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<span on:click={closeSidebar} class="cursor-pointer px-4">
				<i class="fa-solid fa-arrow-left"></i>
			</span>
			{:else}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<span on:click={openSidebar} class="px-4">
				<i class="fa-solid m-2  fa-bars cursor-pointer"></i>
			</span>
			{/if}
		</div>
		<nav class="">
			{#each menuItems as item,i}
			<a href="{menuItemsData[item].path}" class="flex {$page.url.pathname === menuItemsData[item].path ? 'bg-gray-700' : ''} items-center text-white space-x-2 px-4 py-3 rounded hover:bg-gray-700">
				<i class="fa-solid m-2 fa-{menuItemsData[item].icon}"></i>
				<!-- Hiding the names of menu items when sidebar is closed -->
				{#if state.sidebarOpen}
				<div class="flex w-full  justify-between">
					<div class="flex" data-ix = {i}>{menuItemsData[item].name}</div>
					<div class="px-3 flex  text-md text-bold">{menuItemsData[item].count}</div>
				</div>
				{/if}
			</a>
			{/each}
		</nav>
	</aside>
</div>
