export const VALIDATION_KEY = 'altaris.comprehension.v1';
export function validationResult(cell: string, ind: string, answers: string[], now = new Date()) {
  return { schema: 'altaris.comprehension/1', cell, indicator: ind, answers, score: Number(answers[0] === 'uncertain') + Number(answers[1] === 'sensitivity'), total: 2, recorded_at: now.toISOString() };
}
export function saveValidation(storage: Pick<Storage, 'getItem' | 'setItem'>, result: ReturnType<typeof validationResult>) {
  const previous = JSON.parse(storage.getItem(VALIDATION_KEY) ?? '[]');
  storage.setItem(VALIDATION_KEY, JSON.stringify([...(Array.isArray(previous) ? previous : []), result]));
}
