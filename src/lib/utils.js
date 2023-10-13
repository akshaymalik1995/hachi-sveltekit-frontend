export function argSort(list_score, mask = [1], key = null) {
    let temp_scoreIndex = [];
    if (mask.length != 1 && mask.length != list_score.length) {
        throw new Error("Assertion failed");
    }

    for (let i = 0; i < list_score.length; i++) {
        let current_ix = i;
        if (mask[i % mask.length] !== 1) {
            current_ix = -1; // indicating invalid index, not to show/render
        }

        if (key) {
            temp_scoreIndex.push({ ix: current_ix, score: list_score[i][key] });
        } else {
            temp_scoreIndex.push({ ix: current_ix, score: list_score[i] });
        }
    }

    temp_scoreIndex.sort((a, b) => {
        if (a.score > b.score) {
            return -1
        }
        else if (a.score < b.score) {
            return 1
        } else {
            return 0
        }
    })

    return temp_scoreIndex
}


