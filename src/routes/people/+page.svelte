<script>
    import People from "$lib/People.svelte";
    export let data
    const {people_list, people_data} = data
    console.log("PEOPLE LIST", people_list, people_data)
    const peopleDataKeyValue = Object.entries(people_data)
    peopleDataKeyValue.sort((a, b) => b[1].numOfPhotos - a[1].numOfPhotos)
</script>

    
<People people_list = {people_list} />