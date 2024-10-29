
export function argSort(originalScoreIndex, new_scores, mask = [1], key = null) {
    let newScoreIndex = []
    if (mask.length != 1 && mask.length != new_scores.length) {
        throw new Error("Assertion failed");
    }

    for (let i = 0; i < new_scores.length; i++) {
        let current_ix = i;
        if (mask[i % mask.length] !== 1) {
            current_ix = -1; // indicating invalid index, not to show/render
        }

        if (key) {
            newScoreIndex.push({ ix: current_ix + originalScoreIndex.length, score: new_scores[i][key] });
        } else {
            newScoreIndex.push({ ix: current_ix + originalScoreIndex.length, score: new_scores[i] });
        }
    }

    const mergedIndex = [...originalScoreIndex, ...newScoreIndex];

    mergedIndex.sort((a, b) => +b.score - +a.score);

    console.log("Merged index", mergedIndex);

    return mergedIndex;
}

export function convertPathString(path) {
    // Remove any trailing slashes (both backslash and forward slash)
    path = path.replace(/[\/\\]+$/, '');
    path = path.split('\\').join('-');
    // Replace all backslashes with ' > '
    return path
}

export function getMonthYear(date) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
}

export function getDateString(date) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const day = date.getDate()
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}


export function parseDate(metadata) {
    let datestring = metadata.taken_at
    // Split the date string into date and time parts
    const [date, time] = datestring.split(' ');

    // Replace the colons with dashes in the date part
    const formattedDate = date.replace(/:/g, '-');

    // Concatenate the date and time parts with a space in between
    const formattedDateString = `${formattedDate} ${time}`;

    // Parse the formatted date string
    let parsedDate = new Date(formattedDateString);

    // Check if date parsing succeeded
    if (!isNaN(parsedDate)) {
        return parsedDate;
    }
    // If parsing fails or datestring was "unknown", return empty string
    const modified_at = metadata.modified_at
    const modifiedDate = new Date(modified_at)
    return modifiedDate

}

export function sortImageDataByDate(data, descending = true) {
    data.scoreIndex.sort((a, b) => {
        const time1 = parseDate(data.meta_data[a.ix]).getTime();
        const time2 = parseDate(data.meta_data[b.ix]).getTime();
        const diff = descending ? time2 - time1 : time1 - time2;
        return diff;
    });
    return data;
}

export function parsePersonList(personList) {
    if (typeof personList === "string") {
        if (personList.includes(",")) {
            personList = personList.split(",")
        } else {
            personList = [personList]
        }
    }
    return personList
}

