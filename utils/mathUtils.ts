// A simple solver to check if a set of numbers is solvable for 24
// We use this to ensure generated numbers are valid.

const EPSILON = 0.001;

function solve24(nums: number[]): boolean {
  if (nums.length === 1) {
    return Math.abs(nums[0] - 24) < EPSILON;
  }

  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i === j) continue;

      const a = nums[i];
      const b = nums[j];
      const remaining = nums.filter((_, index) => index !== i && index !== j);

      // Addition
      if (solve24([...remaining, a + b])) return true;
      
      // Multiplication
      if (solve24([...remaining, a * b])) return true;
      
      // Subtraction (a - b)
      if (solve24([...remaining, a - b])) return true;
      
      // Division (a / b)
      if (b !== 0 && solve24([...remaining, a / b])) return true;
    }
  }
  return false;
}

export const generateSolvableNumbers = (): number[] => {
  while (true) {
    const nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1);
    if (solve24(nums)) {
      return nums;
    }
  }
};

export const calculateResult = (a: number, b: number, op: string): number | null => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': 
      if (Math.abs(b) < EPSILON) return null;
      return a / b;
    default: return null;
  }
};
