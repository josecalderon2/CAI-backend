import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ThemeModule } from '../src/theme/theme.module';

describe('ThemeController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThemeModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/theme/colors (GET)', () => {
    return request(app.getHttpServer())
      .get('/theme/colors')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('primaryBlue');
        expect(res.body).toHaveProperty('accentOrange');
        expect(res.body).toHaveProperty('successGreen');
        expect(res.body).toHaveProperty('errorRed');

        // Verify primaryBlue structure
        expect(res.body.primaryBlue.red).toBe(31);
        expect(res.body.primaryBlue.green).toBe(119);
        expect(res.body.primaryBlue.blue).toBe(184);
        expect(res.body.primaryBlue.hex).toBe('#1F77B8');

        // Verify accentOrange structure
        expect(res.body.accentOrange.red).toBe(255);
        expect(res.body.accentOrange.green).toBe(149);
        expect(res.body.accentOrange.blue).toBe(0);
        expect(res.body.accentOrange.hex).toBe('#FF9500');

        // Verify successGreen structure
        expect(res.body.successGreen.red).toBe(16);
        expect(res.body.successGreen.green).toBe(185);
        expect(res.body.successGreen.blue).toBe(129);
        expect(res.body.successGreen.hex).toBe('#10B981');

        // Verify errorRed structure
        expect(res.body.errorRed.red).toBe(239);
        expect(res.body.errorRed.green).toBe(68);
        expect(res.body.errorRed.blue).toBe(68);
        expect(res.body.errorRed.hex).toBe('#EF4444');
      });
  });
});
