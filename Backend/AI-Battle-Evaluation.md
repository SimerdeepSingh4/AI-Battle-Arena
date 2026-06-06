# AI Battle Arena - Factorial Function Evaluation

## Problem Statement
Write a code for Factorial function in JS

---

## Solution 1: Advanced Factorial Implementations

### 1. Basic Recursive Approach
```javascript
function factorial(n) {
    if (n < 0) return NaN; // Factorial of negative numbers is undefined
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

// Example usage:
console.log(factorial(5)); // Output: 120
```

### 2. Iterative Approach (More efficient for large numbers)
```javascript
function factorial(n) {
    if (n < 0) return NaN;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Example usage:
console.log(factorial(5)); // Output: 120
```

### 3. One-Liner with Recursion (ES6)
```javascript
const factorial = n => n < 0 ? NaN : n <= 1 ? 1 : n * factorial(n - 1);

// Example usage:
console.log(factorial(5)); // Output: 120
```

### 4. Using BigInt for Very Large Numbers
```javascript
function factorial(n) {
    if (n < 0) return NaN;
    let result = 1n; // Note the 'n' suffix for BigInt
    for (let i = 2n; i <= BigInt(n); i++) {
        result *= i;
    }
    return result;
}

// Example usage:
console.log(factorial(20).toString()); // Output: "2432902008176640000"
```

### 5. Memoization (Caching results for better performance)
```javascript
const factorial = (() => {
    const cache = {0: 1n, 1: 1n};

    return function(n) {
        if (n < 0) return NaN;
        if (cache[n] !== undefined) return cache[n];

        let result = 1n;
        for (let i = 2n; i <= BigInt(n); i++) {
            if (cache[i] === undefined) {
                result *= i;
                cache[i] = result;
            } else {
                result = cache[i];
            }
        }
        return result;
    };
})();

// Example usage:
console.log(factorial(5).toString()); // Output: "120"
console.log(factorial(10).toString()); // Output: "3628800"
```

---

## Solution 2: Simple Factorial Implementation

Below is a simple implementation of a factorial function in JavaScript. This function calculates the factorial of a given non-negative integer `n`.

```javascript
function factorial(n) {
    if (n < 0) {
        throw new Error("Factorial is not defined for negative numbers.");
    }
    if (n === 0 || n === 1) {
        return 1;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Example usage:
console.log(factorial(5)); // Output: 120
console.log(factorial(0)); // Output: 1
console.log(factorial(10)); // Output: 3628800
```

### Explanation:
- **Input Validation**: The function first checks if the input `n` is negative. If it is, an error is thrown because the factorial is not defined for negative numbers.
- **Base Case**: If `n` is 0 or 1, the function returns 1, as the factorial of 0 and 1 is defined to be 1.
- **Iterative Calculation**: For `n > 1`, the function initializes `result` to 1 and then iterates from 2 to `n`, multiplying `result` by each integer in this range.

### Recursive Version:
If you prefer a recursive implementation, here it is:

```javascript
function factorialRecursive(n) {
    if (n < 0) {
        throw new Error("Factorial is not defined for negative numbers.");
    }
    if (n === 0 || n === 1) {
        return 1;
    }
    return n * factorialRecursive(n - 1);
}

// Example usage:
console.log(factorialRecursive(5)); // Output: 120
console.log(factorialRecursive(0)); // Output: 1
console.log(factorialRecursive(10)); // Output: 3628800
```

Both versions will correctly compute the factorial of a non-negative integer. Choose the one that best fits your needs or preferences!

---

## Judge's Evaluation

### Solution 1 - Advanced Implementations

| Category | Score |
|----------|-------|
| Correctness | 10/10 |
| Relevance | 10/10 |
| Completeness | 10/10 |
| Clarity | 10/10 |
| Helpfulness | 10/10 |
| **Final Score** | **10/10** |

#### Strengths:
- Provides 5 distinct and practical ways to solve the problem (Recursive, Iterative, One-liner, BigInt, and Memoized)
- Correctly identifies and addresses the limitation of JavaScript standard Numbers by introducing a BigInt solution
- The memoized solution is highly optimized and works correctly with BigInt

#### Weaknesses:
- None identified

#### Justification:
Solution A is exceptional. Providing a BigInt implementation is crucial for a factorial function in JavaScript, because factorials grow extremely quickly and exceed MAX_SAFE_INTEGER at 19!. The inclusion of memoization also adds immense value.

---

### Solution 2 - Simple Implementation

| Category | Score |
|----------|-------|
| Correctness | 10/10 |
| Relevance | 10/10 |
| Completeness | 9/10 |
| Clarity | 10/10 |
| Helpfulness | 9/10 |
| **Final Score** | **9.7/10** |

#### Strengths:
- Provides both iterative and recursive solutions
- Includes excellent input validation (throwing actual errors for negative numbers instead of returning NaN is great practice)
- Very clear and logical explanations

#### Weaknesses:
- Does not mention or solve the precision limitation of JavaScript Numbers for larger factorials (n >= 19)

#### Justification:
Solution B is very well-written and clear. It handles error cases properly by throwing an Error rather than returning NaN. However, it fails to mention that JavaScript's safe integer limit restricts the calculation to 18!, after which precision is lost. Failing to provide or mention a BigInt alternative makes it slightly less complete.

---

## 🏆 Winner: **Solution 1 (Advanced Implementations)**

### Winner Reason:
Solution A is the winner because it addresses the JavaScript-specific limitation regarding large numbers. Since factorials grow exponentially, using standard floating-point numbers in JavaScript results in precision loss past 18!. By including a BigInt implementation and a memoized variation, Solution A provides a much more robust and production-ready toolset for developers.
