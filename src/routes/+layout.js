export const ssr = false
export const csr = true
export const prerender = true

import { DOMAIN } from '$lib/stores'
export async function load({ fetch }) {
    let images_data = {}

    const people_data = []
    const directories_data = {}
    const response = await fetch(DOMAIN + "/getGroup/person")
    const data = await response.json()
    const people_list = data.person
    for (let i = 0; i < data["meta_data"].length; i++) {
        let personList = data['meta_data'][i]['person']
        for (let p = 0; p < personList.length; p++) {
            const person = personList[p]

            if (!(person in people_data)) {
                people_data[person] = {
                    numOfPhotos : 0
                }
            }
            people_data[person].numOfPhotos += 1

        }
        let path = data['meta_data'][i]['absolute_path']
        const directory = path.match(/^.*[\/\\](?=[^\/\\]+$)/);

        if (!(directory in directories_data)) {
            directories_data[directory] = {}
        }
        

        const image = {
            hash: data["data_hash"][i],
            score: data["score"][i],
            meta: data["meta_data"][i],
            scoreindex: {ix : i, score: data['score'][i]}
        }

        directories_data[directory][path] = image
        images_data[path] = image
    }


    return {
        images_data,
        people_data,
        people_list,
        directories_data
    }
}  