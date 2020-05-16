/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

export interface Interval {
  start: number;
  end: number;
}

export enum IntervalBoundaries {
  START_INCLUDED_END_EXCLUDED,
  START_EXCLUDED_END_INCLUDED,
  BOTH_INCLUDED,
  BOTH_EXCLUDED
}

export function calculateIntervalSize(interval: Interval, boundaries: IntervalBoundaries): number {
  let size;
  switch (boundaries) {
    case IntervalBoundaries.BOTH_EXCLUDED:
      size = interval.end - interval.start - 1;
      break;
    case IntervalBoundaries.BOTH_INCLUDED:
      size = interval.end - interval.start + 1;
      break;
    case IntervalBoundaries.START_EXCLUDED_END_INCLUDED:
    case IntervalBoundaries.START_INCLUDED_END_EXCLUDED:
      size = interval.end - interval.start;
      break;
    default:
      throw new Error('Invalid interval boundaries: ' + boundaries);
  }

  if (size > 0) {
    return size;
  } else {
    let startBoundary;
    let endBoundary;
    switch (boundaries) {
      case IntervalBoundaries.BOTH_EXCLUDED:
        startBoundary = '(';
        endBoundary = ')';
        break;
      case IntervalBoundaries.BOTH_INCLUDED:
        startBoundary = '[';
        endBoundary = ']';
        break;
      case IntervalBoundaries.START_EXCLUDED_END_INCLUDED:
        startBoundary = '(';
        endBoundary = ']';
        break;
      case IntervalBoundaries.START_INCLUDED_END_EXCLUDED:
        startBoundary = '[';
        endBoundary = ')';
        break;
      default:
        throw new Error('Invalid interval boundaries: ' + boundaries);
    }
    throw new Error(`Invalid interval: ${startBoundary}${interval.start}, ${interval.end}${endBoundary}`);
  }
}

export function isValidInterval(interval: Interval, boundaries: IntervalBoundaries): boolean {
  return calculateIntervalSize(interval, boundaries) > 0;
}

export function areOverlappingIntervals(
  intervalA: Interval, intervalB: Interval, boundaries: IntervalBoundaries
): boolean {
  if (intervalA === null || intervalA === undefined || intervalB === null || intervalB === undefined
    || !isValidInterval(intervalA, boundaries) || !isValidInterval(intervalB, boundaries)) {
    return false;
  } else {
    switch (boundaries) {
      case IntervalBoundaries.BOTH_INCLUDED:
        return (intervalA.start >= intervalB.start && intervalA.start <= intervalB.end)
          || (intervalA.end >= intervalB.start && intervalA.end <= intervalB.end)
          || (intervalA.start <= intervalB.start && intervalA.end >= intervalB.end);
      case IntervalBoundaries.BOTH_EXCLUDED:
        return (intervalA.start > intervalB.start && intervalA.start < intervalB.end)
          || (intervalA.end > intervalB.start && intervalA.end < intervalB.end)
          || (intervalA.start <= intervalB.start && intervalA.end >= intervalB.end);
      case IntervalBoundaries.START_INCLUDED_END_EXCLUDED:
        return (intervalA.start >= intervalB.start && intervalA.start < intervalB.end)
          || (intervalA.end > intervalB.start && intervalA.end < intervalB.end)
          || (intervalA.start <= intervalB.start && intervalA.end >= intervalB.end);
      case IntervalBoundaries.START_EXCLUDED_END_INCLUDED:
        return (intervalA.start > intervalB.start && intervalA.start < intervalB.end)
          || (intervalA.end > intervalB.start && intervalA.end <= intervalB.end)
          || (intervalA.start <= intervalB.start && intervalA.end >= intervalB.end);
      default:
        throw new Error('Invalid interval boundaries: ' + boundaries);
    }
  }
}
