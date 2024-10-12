export const ssr = false
export const csr = true
// export const prerender = true
import { imagesDataStore } from '../lib/stores'
import { convertPathString } from '../lib/utils'

function parseDate(dateString) {
    // Split the date string into date and time parts
    const [date, time] = dateString.split(' ');

    // Replace the colons with dashes in the date part
    const formattedDate = date.replace(/:/g, '-');

    // Concatenate the date and time parts with a space in between
    const formattedDateString = `${formattedDate} ${time}`;

    // Parse the formatted date string
    return new Date(formattedDateString);
}

function getMonthYear(date) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
}

function initializeImageData() {
    return {
        data_hash: [],
        score: [],
        meta_data: [],
        scoreIndex: []
    }
}

import { DOMAIN } from '$lib/stores'
export async function load({ fetch }) {
    let images_data = {
        data_hash: [],
        score: [],
        meta_data: [],
        scoreIndex: []
    }

    let likedImagesData = {
        data_hash: [],
        score: [],
        meta_data: [],
        scoreIndex: []
    }

    let calendarImagesData = {}

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
                    numOfPhotos: 0
                }
            }
            people_data[person].numOfPhotos += 1

        }

        // CALENDER IMAGES DATA
        const metadata = data['meta_data'][i] // Get meta data
        const takenAt = metadata.taken_at // Get the date

        // console.log(takenAt.toString())

        if (takenAt && takenAt !== "unknown") {
            const date = parseDate(takenAt) // Get date object 
            
            const title = getMonthYear(date) // Get December 2021
            if (!Object.keys(calendarImagesData).includes(title)) {
                calendarImagesData[title] = initializeImageData()
            }

            if (title.includes(undefined)) {
                console.log(takenAt)
            }

            calendarImagesData[title].data_hash.push(data["data_hash"][i])
            calendarImagesData[title].score.push(data["score"][i])
            calendarImagesData[title].meta_data.push(data["meta_data"][i])
            calendarImagesData[title].scoreIndex.push({ ix: calendarImagesData[title].scoreIndex.length, score: data['score'][i] })
        }


        let path = data['meta_data'][i]['absolute_path']
        let directory = path.match(/^.*[\/\\](?=[^\/\\]+$)/);
        directory = convertPathString(directory[0])

        if (!(directory in directories_data)) {
            directories_data[directory] = {
                data_hash: [],
                score: [],
                meta_data: [],
                scoreIndex: []
            }
        }

        if (data['meta_data'][i].is_favourite === "true") {
            likedImagesData.data_hash.push(data["data_hash"][i])
            likedImagesData.score.push(data["score"][i])
            likedImagesData.meta_data.push(data["meta_data"][i])
            likedImagesData.scoreIndex.push({ ix: likedImagesData.scoreIndex.length, score: data['score'][i] })
        }


        directories_data[directory].data_hash.push(data["data_hash"][i])
        directories_data[directory].score.push(data["score"][i])
        directories_data[directory].meta_data.push(data["meta_data"][i])
        directories_data[directory].scoreIndex.push({ ix: directories_data[directory].scoreIndex.length, score: data['score'][i] })



        images_data.data_hash.push(data["data_hash"][i])
        images_data.score.push(data["score"][i])
        images_data.meta_data.push(data["meta_data"][i])
        images_data.scoreIndex.push({ ix: i, score: data['score'][i] })

    }

    return {
        images_data,
        people_data,
        people_list,
        directories_data,
        likedImagesData,
        calendarImagesData
    }
}  