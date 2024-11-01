<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	import {
		Sidebar,
		SidebarDropdownWrapper,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import {
		AngleDownOutline,
		AngleUpOutline,
		ClipboardListSolid,
		CogOutline,
		FileChartBarSolid,
		GithubSolid,
		LayersSolid,
		LifeSaverSolid,
		LockSolid,
		WandMagicSparklesOutline,
		ChartPieOutline,
		RectangleListSolid,
		TableColumnSolid
	} from 'flowbite-svelte-icons';

	import { onMount } from "svelte";
	import {DOMAIN, likedImagesStore, calendarImagesStore, directoriesDataStore, imagesDataStore} from "$lib/stores.js"
	export const sidebarOpen = true;

	let likedPhotosCount = $likedImagesStore['meta_data'].length
	let calendarCount = Object.keys($calendarImagesStore).length
	let albumsCount = Object.keys($directoriesDataStore).length
	let photosCount = $imagesDataStore['meta_data'].length

	$ : {
		console.log($likedImagesStore)
		menuItemsData["favourites"].count = $likedImagesStore['meta_data'].length
	}

	export let drawerHidden = false;

	$ : {
		console.log('DRAWER HIDDEN INSIDE SIDEBAR', drawerHidden);
	}

	const menuItems = ["albums", 'photos' , "people", "calendar", 'favourites','search', "indexing",  ]
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
		
		photos : {
			icon: "image",
			path: "/photos",
			name: "Photos",
			count: photosCount,
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

	async function updateMetaStats(){
			const response = await fetch(DOMAIN + "/getMetaStats")
			const data = await response.json()
			console.log("DATA FETCHED TO PROVIDE IMAGES COUNT IMAGES")
			menuItemsData.people.count = data.image.unique_people_count
		}

		onMount(()=> {
			updateMetaStats()
		})

	const closeDrawer = () => {
		drawerHidden = true;
	};

	let iconClass =
		'flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white';
	let itemClass =
		'flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700';
	let groupClass = 'pt-2 space-y-2';

	$: mainSidebarUrl = $page.url.pathname;
	let activeMainSidebar;

	afterNavigate((navigation) => {
		// this fixes https://github.com/themesberg/flowbite-svelte/issues/364
		document.getElementById('svelte')?.scrollTo({ top: 0 });
		closeDrawer();

		activeMainSidebar = navigation.to?.url.pathname ?? '';
	});


</script>

<Sidebar
	class={drawerHidden ? 'hidden' : ''}
	activeUrl={mainSidebarUrl}
	activeClass="bg-gray-100 dark:bg-gray-700"
	asideClass="fixed inset-0 z-30 flex-none h-full w-64 lg:h-auto border-e border-gray-200 dark:border-gray-600 lg:overflow-y-visible lg:pt-16 lg:block"
>
	<h4 class="sr-only">Main menu</h4>
	<SidebarWrapper
		divClass="overflow-y-auto px-3 pt-20 lg:pt-5 h-full bg-white dark:bg-gray-800 scrolling-touch max-w-2xs lg:h-[calc(100vh-4rem)] lg:block lg:me-0 lg:sticky top-2"
	>
		<nav class="divide-y divide-gray-200 dark:divide-gray-700">
			<SidebarGroup ulClass={groupClass} class="mb-3">
				{#each menuItems as item, i}
				<a href="{menuItemsData[item].path}" class="flex {$page.url.pathname === menuItemsData[item].path ? 'bg-gray-200 dark:bg-gray-900' : ''} items-center text-gray-900 dark:text-gray-200 space-x-2 px-4 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
					<i class="fa-solid m-2 fa-{menuItemsData[item].icon} text-gray-500 dark:text-gray-400"></i>
					<!-- Hiding the names of menu items when sidebar is closed -->
					<div class="flex w-full justify-between">
						<div class="flex" data-ix={i}>{menuItemsData[item].name}</div>
						<div class="px-3 flex text-md text-bold text-gray-900 dark:text-gray-200">{menuItemsData[item].count}</div>
					</div>
				</a>
				{/each}
			</SidebarGroup>
		</nav>
	</SidebarWrapper>
</Sidebar>

<div
	hidden={drawerHidden}
	class="fixed inset-0 z-20 bg-gray-900/50 dark:bg-gray-900/60"
	on:click={closeDrawer}
	on:keydown={closeDrawer}
	role="presentation"
/>