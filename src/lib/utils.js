
export function argSort(originalScoreIndex, new_scores, mask = [1], key = null) {
    let mergedScores = [];
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

    newScoreIndex.sort((a, b) => b.score - a.score);

    let i = 0; // pointer for sortedArray
    let j = 0; // pointer for newArray

    // Merge two arrays
    while (i < originalScoreIndex.length && j < newScoreIndex.length) {
        if (originalScoreIndex[i].score >= newScoreIndex[j].score) {
            mergedScores.push(originalScoreIndex[i]);
            i++;
        } else {
            mergedScores.push(newScoreIndex[j]);
            j++;
        }
    }

     // If there are remaining elements in sortedArray, add them
     while (i < originalScoreIndex.length) {
        mergedScores.push(originalScoreIndex[i]);
        i++;
    }

    // If there are remaining elements in newArray, add them
    while (j < newScoreIndex.length) {
        mergedScores.push(newScoreIndex[j]);
        j++;
    }
    console.log('merged scores', mergedScores)
    return mergedScores;
}

export function convertPathString(path) {
    // Remove any trailing slashes (both backslash and forward slash)
    path = path.replace(/[\/\\]+$/, '');
    path = path.split('\\').join('-');
    // Replace all backslashes with ' > '
    return path
}


