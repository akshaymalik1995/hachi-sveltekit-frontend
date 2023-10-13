<script>
	import { onMount } from "svelte";
	import {DOMAIN} from "$lib/stores.js"
	import {page} from "$app/stores"
	export const sidebarOpen = true;
	
	const state = {
		sidebarOpen: sidebarOpen,
	};
	const menuItems = ["photos", 'search',  "indexing", "people" ]
	const menuItemsData = {
		search : {
			icon: "search",
			path: "/search",
			name: "Search",
			count: 0,
		},
		photos : {
			icon: "image",
			path: "/photos",
			name: "Photos",
			count: 0,
		},
	
		indexing : {
			icon: "book-atlas",
			path: "/indexing",
			name: "Index",
			count: 0,
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
			menuItemsData.photos.count = data.image.count
		}

		onMount(()=> {
			updateMetaStats()
		})

		

		

	
</script>


<div class="flex sticky top-0 z-10 shadow h-screen text-white">
	<aside  class="{state.sidebarOpen && 'w-64'}">
		<div class="flex h-16 items-center justify-between font-semifold text-black">
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
				<i class="fa-solid fa-bars cursor-pointer"></i>
			</span>
			{/if}
		</div>
		<nav class="">
			{#each menuItems as item,i}
			<a href="{menuItemsData[item].path}" class="flex {$page.url.pathname === menuItemsData[item].path ? 'bg-gray-200' : ''} items-center space-x-2 px-4 py-3 text-black hover:bg-gray-100 hover:text-black">
				<i class="fa-solid fa-{menuItemsData[item].icon}"></i>
				<!-- Hiding the names of menu items when sidebar is closed -->
				{#if state.sidebarOpen}
				<div class="flex w-full justify-between">
					<div class="flex" data-ix = {i}>{menuItemsData[item].name}</div>
					<div class="px-3 flex text-black text-md text-bold">{menuItemsData[item].count}</div>
				</div>
				{/if}
			</a>
			{/each}
		</nav>
	</aside>
</div>
