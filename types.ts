export interface NumberItem {
  id: string;
  value: number;
  label: string; // To show expressions like (8+4) if needed, though we mostly solve immediately
}

export enum Operator {
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '×',
  DIVIDE = '÷',
}

export interface GameHistoryStep {
  numbers: NumberItem[];
  description: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface GeminiHintResponse {
  hint: string;
  solution?: string;
}
