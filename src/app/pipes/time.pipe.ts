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

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(time: number, millisPrecision: number = 0): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);

    const formatTime = timeToFormat => timeToFormat < 10 ? '0' + timeToFormat : timeToFormat;

    const formattedTime = formatTime(minutes) + ':' + formatTime(seconds);
    if (millisPrecision > 0) {
      let millis = String(Math.round(time % 1 * Math.pow(10, millisPrecision)));
      while (millis.length < millisPrecision) {
        millis = '0' + millis;
      }

      return formattedTime + '.' + millis;
    } else {
      return formattedTime;
    }
  }
}
