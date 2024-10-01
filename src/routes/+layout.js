export const ssr = false
export const csr = true
export const prerender = true

import { DOMAIN } from '$lib/stores'
export async function load({ fetch }) {
    let images_data = {
        data_hash: [],
        score: [],
        meta_data: [],
        scoreIndex: []
    }

    const people_data = []
    const directories_data = []
    const response = await fetch(DOMAIN + "/getGroup/person")
    const data = await response.json()
    console.log("DATA", data)
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
            directories_data[directory] = {
                data_hash: [],
                score: [],
                meta_data: [],
                scoreIndex: []
            }
        }
        

        directories_data[directory].data_hash.push(data["data_hash"][i])
        directories_data[directory].score.push(data["score"][i])
        directories_data[directory].meta_data.push(data["meta_data"][i])
        directories_data[directory].scoreIndex.push({ ix: directories_data[directory].scoreIndex.length, score: data['score'][i] })
        
        images_data.data_hash.push(data["data_hash"][i])
        images_data.score.push(data["score"][i])
        images_data.meta_data.push(data["meta_data"][i])
        images_data.scoreIndex.push({ix : i, score: data['score'][i]})

    }


    return {
        images_data,
        people_data,
        people_list,
        directories_data
    }
}  