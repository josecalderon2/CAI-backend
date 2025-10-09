import { Injectable } from '@nestjs/common';
import { ColorDto, ColorSchemeDto } from './dto/color-scheme.dto';

@Injectable()
export class ThemeService {
  private createColor(red: number, green: number, blue: number): ColorDto {
    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    const hex = `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
    const rgb = `rgb(${red}, ${green}, ${blue})`;

    return {
      red,
      green,
      blue,
      hex,
      rgb,
    };
  }

  getColorScheme(): ColorSchemeDto {
    return {
      primaryBlue: this.createColor(31, 119, 184),
      accentOrange: this.createColor(255, 149, 0),
      successGreen: this.createColor(16, 185, 129),
      errorRed: this.createColor(239, 68, 68),
    };
  }
}
