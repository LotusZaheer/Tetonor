/**
 * Tetonor Game Engine
 * Generates puzzles and validates answers.
 */

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Generates a new Tetonor puzzle.
 *
 * Returns:
 * {
 *   pairs: [{ a, b, sum, product }],       // 8 pairs with their results
 *   sortedNumbers: number[],                // all 16 numbers sorted
 *   visibleIndices: Set<number>,            // indices (in sortedNumbers) that are visible
 *   hiddenIndices: Set<number>,             // indices that are hidden (player must find them)
 * }
 */
export function generatePuzzle() {
    // 1. Generate 16 random numbers (1 - 99, may repeat)
    const numbers = Array.from({ length: 16 }, () => randomInt(1, 99));

    // 2. Shuffle and pair them into 8 pairs
    const shuffled = shuffle(numbers);
    const pairs = [];
    for (let i = 0; i < 16; i += 2) {
        const a = shuffled[i];
        const b = shuffled[i + 1];
        pairs.push({
            a,
            b,
            sum: a + b,
            product: a * b,
        });
    }

    // 3. Sort all 16 numbers
    const sortedNumbers = [...numbers].sort((x, y) => x - y);

    // 4. Pick 8 random indices to show, 8 to hide
    const indices = Array.from({ length: 16 }, (_, i) => i);
    const shuffledIndices = shuffle(indices);
    const visibleIndices = new Set(shuffledIndices.slice(0, 8));
    const hiddenIndices = new Set(shuffledIndices.slice(8));

    return {
        pairs,
        sortedNumbers,
        visibleIndices,
        hiddenIndices,
    };
}

/**
 * Checks if two numbers correctly match a pair's sum and product.
 */
export function checkPairAnswer(pair, num1, num2) {
    const sumOk = num1 + num2 === pair.sum;
    const productOk = num1 * num2 === pair.product;
    return sumOk && productOk;
}

/**
 * Checks if ALL pairs have been correctly solved.
 */
export function checkAllAnswers(pairs, answers) {
    return pairs.every((pair, i) => {
        const ans = answers[i];
        if (ans.num1 === null || ans.num2 === null) return false;
        return checkPairAnswer(pair, ans.num1, ans.num2);
    });
}
