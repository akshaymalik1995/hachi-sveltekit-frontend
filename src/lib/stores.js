import { writable } from "svelte/store";
export const DOMAIN = "http://localhost:8200"

export const MonthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]


// UNMUTABLE VALUES

export const imagesDataStore = writable({})
export const likedImagesStore = writable({})
export const calendarImagesStore = writable({})
export const peopleListStore = writable([])
export const directoriesDataStore = writable({})
export const peopleDataStore = writable({})



