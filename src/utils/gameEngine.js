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
 *   normalTasks: [{ value, type, target: [a, b] }], // 16 independent results shuffled
 *   sortedNumbers: number[],                // all 16 numbers sorted
 *   visibleIndices: Set<number>,            // indices (in sortedNumbers) that are visible
 *   hiddenIndices: Set<number>,             // indices that are hidden
 * }
 */
export function generatePuzzle() {
    // 1. Generate 16 random numbers (1 - 99, may repeat)
    const numbers = Array.from({ length: 16 }, () => randomInt(1, 99));

    // 2. Shuffle and pair them into 8 pairs
    const shuffledNumbers = shuffle(numbers);
    const pairs = [];
    for (let i = 0; i < 16; i += 2) {
        const a = shuffledNumbers[i];
        const b = shuffledNumbers[i + 1];
        pairs.push({ a, b, sum: a + b, product: a * b });
    }

    // 3. Create 16 independent tasks for Normal Mode
    let normalTasks = [];
    pairs.forEach(p => {
        normalTasks.push({ value: p.sum, type: '+', target: [p.a, p.b] });
        normalTasks.push({ value: p.product, type: '*', target: [p.a, p.b] });
    });
    normalTasks = shuffle(normalTasks);

    // 4. Sort all 16 numbers
    const sortedNumbers = [...numbers].sort((x, y) => x - y);

    // 5. Pick 8 random indices to show, 8 to hide
    const indices = Array.from({ length: 16 }, (_, i) => i);
    const shuffledIndices = shuffle(indices);
    const visibleIndices = new Set(shuffledIndices.slice(0, 8));
    const hiddenIndices = new Set(shuffledIndices.slice(8));

    return {
        pairs,
        normalTasks,
        sortedNumbers,
        visibleIndices,
        hiddenIndices,
    };
}

/**
 * Generates a smaller Tetonor puzzle for Very Easy mode.
 * 4 pairs, 8 numbers total, half visible, half hidden.
 */
export function generateMiniPuzzle() {
    // 1. Generate 8 random numbers (1 - 99, may repeat)
    const numbers = Array.from({ length: 8 }, () => randomInt(1, 99));

    // 2. Shuffle and pair them into 4 pairs
    const shuffledNumbers = shuffle(numbers);
    const pairs = [];
    for (let i = 0; i < 8; i += 2) {
        const a = shuffledNumbers[i];
        const b = shuffledNumbers[i + 1];
        pairs.push({ a, b, sum: a + b, product: a * b });
    }

    // 3. Sort all 8 numbers
    const sortedNumbers = [...numbers].sort((x, y) => x - y);

    // 4. Pick 4 random indices to show, 4 to hide
    const indices = Array.from({ length: 8 }, (_, i) => i);
    const shuffledIndices = shuffle(indices);
    const visibleIndices = new Set(shuffledIndices.slice(0, 4));
    const hiddenIndices = new Set(shuffledIndices.slice(4));

    // 5. Create 8 normal tasks (4 sums, 4 products)
    const normalTasks = [];
    pairs.forEach((p) => {
        normalTasks.push({ value: p.sum, op: '+', pair: p });
        normalTasks.push({ value: p.product, op: 'x', pair: p });
    });
    shuffle(normalTasks);

    return {
        pairs,
        normalTasks,
        sortedNumbers,
        visibleIndices,
        hiddenIndices,
    };
}

/**
 * Validates a single task (result, num1, op, num2).
 * op can be '+' or '*' (also translates 'x' to '*')
 */
export function checkTask(task, num1, num2, op) {
    const operation = op === 'x' ? '*' : op;
    if (operation !== task.type) return false;

    if (operation === '+') {
        return (num1 + num2 === task.value) &&
            ((num1 === task.target[0] && num2 === task.target[1]) ||
                (num1 === task.target[1] && num2 === task.target[0]));
    } else {
        return (num1 * num2 === task.value) &&
            ((num1 === task.target[0] && num2 === task.target[1]) ||
                (num1 === task.target[1] && num2 === task.target[0]));
    }
}

/**
 * Checks if two numbers correctly match a pair's sum and product.
 * (Easy Mode helper)
 */
export function checkPairAnswer(pair, num1, num2) {
    const sumOk = num1 + num2 === pair.sum;
    const productOk = num1 * num2 === pair.product;
    return sumOk && productOk;
}
