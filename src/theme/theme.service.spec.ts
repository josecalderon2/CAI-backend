import { Test, TestingModule } from '@nestjs/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThemeService],
    }).compile();

    service = module.get<ThemeService>(ThemeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getColorScheme', () => {
    it('should return the correct color scheme', () => {
      const colorScheme = service.getColorScheme();

      expect(colorScheme).toBeDefined();
      expect(colorScheme.primaryBlue).toBeDefined();
      expect(colorScheme.accentOrange).toBeDefined();
      expect(colorScheme.successGreen).toBeDefined();
      expect(colorScheme.errorRed).toBeDefined();
    });

    it('should return primaryBlue with correct RGB values', () => {
      const colorScheme = service.getColorScheme();

      expect(colorScheme.primaryBlue.red).toBe(31);
      expect(colorScheme.primaryBlue.green).toBe(119);
      expect(colorScheme.primaryBlue.blue).toBe(184);
      expect(colorScheme.primaryBlue.hex).toBe('#1F77B8');
      expect(colorScheme.primaryBlue.rgb).toBe('rgb(31, 119, 184)');
    });

    it('should return accentOrange with correct RGB values', () => {
      const colorScheme = service.getColorScheme();

      expect(colorScheme.accentOrange.red).toBe(255);
      expect(colorScheme.accentOrange.green).toBe(149);
      expect(colorScheme.accentOrange.blue).toBe(0);
      expect(colorScheme.accentOrange.hex).toBe('#FF9500');
      expect(colorScheme.accentOrange.rgb).toBe('rgb(255, 149, 0)');
    });

    it('should return successGreen with correct RGB values', () => {
      const colorScheme = service.getColorScheme();

      expect(colorScheme.successGreen.red).toBe(16);
      expect(colorScheme.successGreen.green).toBe(185);
      expect(colorScheme.successGreen.blue).toBe(129);
      expect(colorScheme.successGreen.hex).toBe('#10B981');
      expect(colorScheme.successGreen.rgb).toBe('rgb(16, 185, 129)');
    });

    it('should return errorRed with correct RGB values', () => {
      const colorScheme = service.getColorScheme();

      expect(colorScheme.errorRed.red).toBe(239);
      expect(colorScheme.errorRed.green).toBe(68);
      expect(colorScheme.errorRed.blue).toBe(68);
      expect(colorScheme.errorRed.hex).toBe('#EF4444');
      expect(colorScheme.errorRed.rgb).toBe('rgb(239, 68, 68)');
    });
  });
});
