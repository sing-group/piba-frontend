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

export enum VideoSpeed {
  SECONDS_1 = '1s',
  SECONDS_3 = '3s',
  SECONDS_5 = '5s',
  FRAMES_1 = '1fr',
  FRAMES_3 = '3fr',
  FRAMES_5 = '5fr'
}

export function speedIncrement(speed: VideoSpeed): number {
  switch (speed) {
    case VideoSpeed.FRAMES_1:
    case VideoSpeed.SECONDS_1:
      return 1;
    case VideoSpeed.FRAMES_3:
    case VideoSpeed.SECONDS_3:
      return 3;
    case VideoSpeed.FRAMES_5:
    case VideoSpeed.SECONDS_5:
      return 5;
    default:
      throw new Error('Invalid speed value: ' + speed);
  }
}
