export const ssr = false
export const csr = true
export const prerender = true

import { DOMAIN } from '$lib/stores'
export async function load({ fetch }) {
    let image_data = {
        list_metaData: [],
        list_score: [],
        list_dataHash: [],
        sortedScoreIndex : []
    }

    const people_data = []
    const response = await fetch(DOMAIN + "/getGroup/person")
    const data = await response.json()
    const people_list = data.person
    for (let i = 0; i < data["meta_data"].length; i++) {
        let personList = data['meta_data'][i]['person']
        for (let p = 0; p < personList.length; p++) {
            const person = personList[p]

            if (!(person in people_data)) {
                people_data[person] = {
                    list_metaData: [],
                    list_score: [],
                    list_dataHash: [],
                    sortedScoreIndex : [],
                    numOfPhotos : 0
                }
            }

            people_data[person].list_metaData.push(data['meta_data'][i])
            people_data[person].list_score.push(data['score'][i])
            people_data[person].list_dataHash.push(data['data_hash'][i])
            people_data[person].sortedScoreIndex.push({ix : i, score: data['score'][i]})
            people_data[person].numOfPhotos += 1

        }
        image_data.list_dataHash.push(data["data_hash"][i]);
        image_data.list_score.push(data["score"][i]);
        image_data.list_metaData.push(data["meta_data"][i]);
        image_data.sortedScoreIndex.push({ix : i, score: data['score'][i]})
    }

    return {
        image_data,
        people_data,
        people_list
    }
}  