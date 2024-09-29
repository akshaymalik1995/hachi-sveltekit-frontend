<script>
    import Fuzzy from "$lib/Fuzzy.svelte";
    import Photos from "$lib/photos.svelte";
    import Pagination from "$lib/Pagination.svelte";
    import Loading from "$lib/Loading.svelte"
    import { argSort } from "$lib/utils";
    import { page } from "$app/stores";
    import {goto, afterNavigate} from "$app/navigation"
    import { DOMAIN } from "$lib/stores.js";

    let loading = false

    let currentUrl = $page.url; // Get the current URL of the page. Does the current url changes automatically everytime the url changes ? And if yes what is its utility? Ideally the component will rerender only if the currentUrl is directly used in the UI

    let filtersList = ['person', 'query', 'filename', 'place'] // These are the filter options we used. But why do we need it both in the Fuzzy component and here as well.

    

    function createQueryFromUrl(){ // When the page is first loaded with searchParams, we want to generate query using this
        let textQuery = ""
        const currentUrl = $page.url
        for (let key of filtersList){
            if (filtersList.includes(key) && currentUrl.searchParams.get(key)){
                if (textQuery !== "") {textQuery += "&"}
                textQuery += key + "=" + currentUrl.searchParams.get(key)
                console.log(currentUrl.searchParams.get(key))
            }
        }
        return textQuery
        // In the end it will look something like this : person:akshay,query:mountain
    }

    
    



    // Initializing variables to store scores, hashes and metadata about images
    // Scores determine the order of images
    // metaData contains all the information about the image
    let image_scores = [];
    let image_local_hash = [];
    let image_metaData = [];

    let formData; // Initializing the formData
    let current_score_threshold = 0; // We use threshold to filter out images only with really scores
    let queryCompleted = false; // To know that the query is finished and the results are ready
    let topk_input = 3; // I guess it is not used now

    let imageDataForChild = {
        // We basically want to use this to pass it to the Photos component.
        // Though I am not sure why do we need a separate object for it
        meta_data: [],
        data_hash: [],
        score: [],
        scoreIndex: [],
        done: false,
    };

    let text_query = ""; // Initilizing the text query that will eventually be sent to the server
    let query_attributes = {}; // Fuzzy component sends it when query is ready. It is supposed to be used to display possible filters for a query

    async function handleQuery(client_id = "xxxxxxx", got_id = false) {
        
        // This function is executed whenever the query is presented by the Fuzzy component by dispatching a custom event
        console.log("handleQuery count", text_query, got_id, client_id) // Since this is a recursive function, we are logging to see how many times this function got executed
        queryCompleted = false; // We are tracking when the fetching of data will be eventually completed since this is recursive and async function and it may take time
        let topk = topk_input;
        if (text_query === '') {
            text_query = createQueryFromUrl()
        }
        // Creating our POST request to send to the server
        formData = new FormData();
        if (text_query.length === 0 ) return;
        // Taking Query from the URL
        // formData.append("query", text_query);
        // loading = true
        formData.append("query", text_query);
        formData.append("topk", topk.toString());

        if (got_id === false) {
            // goto("/search")
            // Whenever a fresh request is send, we want all the lists to empty
            // Resetting all the variables whenever a fresh request is sent
            queryCompleted = false;
            image_local_hash = [];
            image_scores = [];
            image_metaData = [];
            current_score_threshold = 0;

            // We need to so that we can rerender the Photos component whenever it is updated
            imageDataForChild = {
                meta_data: [],
                data_hash: [],
                score: [],
                scoreIndex: [],
                done: false,
                
            };
            formData.append("query_start", "true"); // We are informing the server that this is a completely new query
            
        
        } else {
            // If the query is not new, we send client id along with the request
            
            formData.append("query_start", "false");
            formData.append("client_id", client_id); // Send this key along with subsequent requests. We would get this from the server
        }

        const url = "/query";
        // We make the query request to the server
        let response = await fetch(DOMAIN + url, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            // If the response is not right, we throw an error
            throw new Error(response);
        }

        let data = await response.json();

        // We receieve these three important lists from the server
        let temp_id = data["client_id"];

        // We receive the data from the server

        image_local_hash = [...data["data_hash"], ...image_local_hash];
        image_scores = [...data["score"], ...image_scores];
        image_metaData = [...data["meta_data"], ...image_metaData];

        imageDataForChild = {
            meta_data: image_metaData,
            data_hash: image_local_hash,
            score : image_scores,
            scoreIndex : argSort(image_scores),
            done: false,
        }

        console.log("QUERY COMPLETED", data["query_completed"], data)

        
        if (data["query_completed"] == true) {
            imageDataForChild.done = true; // This should be enough to indicate svelte
            queryCompleted = true;
            console.log("The query is completed");
            return;
        }

        

        // Keep executing the function unless the query is completed
        
        await handleQuery(temp_id, true);
    }

    handleQuery()

</script>

<div class="flex w-full flex-col p-2">
    <Fuzzy
        on:queryReady={(event) => {
            text_query = event.detail.query;
            handleQuery();
        }}
    />

<Photos searchmode = {true}
    images_data = {imageDataForChild}
/>
</div>
