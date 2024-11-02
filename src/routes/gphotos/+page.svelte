<script>
    import { onMount } from "svelte";
    import { DOMAIN } from "$lib/stores";
    let gClientInfo = null;
    let display_activation_button = false;
    let label = "Upload Client secret json";
    
    function get_client_info() {
        fetch(DOMAIN + "/gClientInfo")
        .then((response) => response.json())
        .then((data) => {
            if (data["client_id_available"] === true) {
                gClientInfo = data;
                if (data["is_activated"] == false) {
                    display_activation_button = true;
                }
            }
        });
    }

    onMount(() => {
        get_client_info();
    });

    function pollActivationStatus() {
        fetch(DOMAIN + "/statusGAuthFlow")
        .then((response) => response.json())
        .then((data) => {
            let is_finished = data["finished"];
            if (is_finished == false) {
                setTimeout(pollActivationStatus, 2000);
            } else {
                display_activation_button = false;
                alert("Account Activation: " + data["status"].toString());
                get_client_info();
            }
        });
    }

    function activate(event) {
        event.target.disabled = true;
        event.target.innerText = "Activation in progress...";
        
        fetch(DOMAIN + "/beginGAuthFlow")
        .then((response) => {
            if (response.ok == false) {
                alert("Some error occurred while starting authorization flow!");
                event.target.disabled = false;
                event.target.innerText = "Activate Google Photos";
            } else {
                setTimeout(pollActivationStatus, 1000);
            }
        });
    }

    function handleClientUpload(event) {
        let expected_redirect = DOMAIN + "/OAuthCallback";
        label = "Upload in progress...";
        event.preventDefault();
        event.target.disabled = true;

        var reader = new FileReader();
        reader.onload = function() {
            var client_data = JSON.parse(reader.result);
            let temp_keys = Object.keys(client_data);
            let is_web_app = temp_keys.includes("web");
            let redirect_uri_valid = false;

            if (is_web_app) {
                if (Object.keys(client_data["web"]).includes("redirect_uris")) {
                    redirect_uri_valid = client_data["web"]["redirect_uris"].includes(expected_redirect);
                }
            }

            if (is_web_app && redirect_uri_valid) {
                let temp_data = new FormData();
                temp_data.append("client_data", reader.result);

                fetch(DOMAIN + "/uploadClientData", {
                    method: "POST",
                    body: temp_data
                })
                .then((response) => {
                    if (response.ok == false) {
                        alert("Some error occurred!");
                    } else {
                        label = "Upload Client secret json";
                        get_client_info();
                        event.target.disabled = false;
                        display_activation_button = true;
                    }
                });
            } else {
                alert("Must be a web app and redirect_uris must contain: " + expected_redirect);
                return;
            }
        };
        reader.readAsText(event.target.files[0]);
    }
</script>

<div class="flex flex-col items-center justify-center w-full p-4 space-y-4">
    {#if gClientInfo}
        <div class="flex flex-col items-center space-y-2">
            <p class="bg-gray-100 p-2 border-2 border-black rounded">{gClientInfo["client_id"]}</p>
            {#if gClientInfo["is_activated"]}
                <p class="bg-green-300 p-2 border-2 border-black rounded">Google photos is active</p>
            {:else}
                <p class="bg-rose-300 p-2 border-2 border-black rounded">Google photos is inactive</p>
            {/if}
        </div>
    {:else}
        <div class="border-2 flex flex-col items-center justify-center bg-blue-200 p-4 rounded">
            <p class="p-4 text-center">
                * Make sure you have created an OAuth credential at Google Cloud Console for this app and have enabled <b>Google Photos API</b>. For details visit <b>https://developers.google.com/photos/library/guides/get-started</b><br>
                * <b>App type</b> must be chosen as <b>Web app</b> and one of the Redirect URIs must be set as <b>http://localhost:5000/api/OAuthCallback</b> in the corresponding credential.<br>
                * Except <b>You</b> and <b>Google</b>, <b>No one</b> would have access to your personal data.
            </p>
            <div class="flex items-center justify-center text-md p-2 bg-blue-300 rounded">
                <label for="file" class="mr-2">{label}</label>
                <input type="file" accept=".json" on:change={handleClientUpload} class="p-2 border rounded"/>
            </div>
        </div>
    {/if}

    {#if display_activation_button}
        <div class="flex justify-center items-center m-3">
            <button class="bg-blue-400 p-2 text-md disabled:bg-blue-200 rounded" on:click={activate}>Activate Google Photos</button>
        </div>
    {/if}
</div>
