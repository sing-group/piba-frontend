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

export class PolypLocation {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  public static areEqual(locationA: PolypLocation, locationB: PolypLocation): boolean {
    return locationA === locationB || (Boolean(locationA) && Boolean(locationB) && locationA.isEqualTo(locationB));
  }

  public isEqualTo(location: PolypLocation): boolean {
    if (location === this) {
      return true;
    } else if (!Boolean(location)) {
      return false;
    } else {
      const regularThis = this.regularize();
      const regularLocation = location.regularize();

      return regularThis.x === regularLocation.x
        && regularThis.y === regularLocation.y
        && regularThis.width === regularLocation.width
        && regularThis.height === regularLocation.height;
    }
  }

  public regularize(): PolypLocation {
    return new PolypLocation(
      Math.min(this.x, this.x + this.width),
      Math.min(this.y, this.y + this.height),
      Math.abs(this.width),
      Math.abs(this.height)
    );
  }

  public isValid(): boolean {
    return this.width !== 0 && this.height !== 0;
  }
}
