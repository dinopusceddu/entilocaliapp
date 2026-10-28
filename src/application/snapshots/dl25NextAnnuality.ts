import type { FundData } from '../../domain/types';
import { carryDl25ToNextYear } from '../../logic/shared/dl25CarryForward';

/** Used only when constructing a new OPEN N+1, never when hydrating an existing snapshot. */
export const prepareDl25NextAnnuality = (source: FundData, defaults: FundData, nextYear: number) =>
  carryDl25ToNextYear(source, defaults, nextYear);
