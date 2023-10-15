import { writable } from "svelte/store";
export const DOMAIN = "http://localhost:8200"
// UNMUTABLE VALUES

// Writable stores
// -1 means no modal selected and modal index will start from 0 i.e. total items
export const lastModal = writable(-1)
export const dark_bg = writable(false)

// The idea is to update by some component... and then subscribed to by in filter.svelte
export const filter_metaData_store = writable([])

export const peopleDataStore = writable({})

export const imageDataStore = writable([])

export const queryResultsStore = writable({
    "last_metaData" : [],
    "last_dataHash" : [],
    "list_score" : [],
    "done" :  false
})