import type { CellDetail, IndicatorKey, Lens, Meta } from './types';
import { hasCanicula } from './verdict';

export function selectIndicator(lens: Lens, current: IndicatorKey, meta: Meta, cell: CellDetail): IndicatorKey {
  if (lens === 'ene') return current;
  const allowed = meta.lenses[lens].filter(i => cell.indicators[i] && (i !== 'jul_aug_mm' || hasCanicula(cell) !== false));
  return allowed.includes(current) ? current : allowed[0] ?? (cell.indicators.annual_mm ? 'annual_mm' : current);
}
