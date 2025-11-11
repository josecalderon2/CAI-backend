import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(private configService: ConfigService) {
    // Crear carpeta de backups si no existe
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Genera un backup de la base de datos PostgreSQL
   */
  async generarBackup(): Promise<string> {
    try {
      // Crear carpeta backups si no existe
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
        this.logger.log(`Carpeta de backups creada: ${this.backupDir}`);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.sql`;
      const filepath = path.join(this.backupDir, filename);

      const dbUrl = this.configService.get<string>('DATABASE_URL');

      if (!dbUrl) {
        throw new Error('DATABASE_URL no está configurada');
      }

      // Parsear la URL de la base de datos
      const dbConfig = this.parseDatabaseUrl(dbUrl);

      this.logger.log('Iniciando backup de la base de datos...');

      // Buscar pg_dump en varias ubicaciones posibles
      const pgDumpPath = await this.findPgDump();
      
      if (!pgDumpPath) {
        throw new Error(
          'No se encontró pg_dump.exe. Por favor verifica que PostgreSQL esté instalado. ' +
          'Ubicaciones verificadas: C:\\Program Files\\PostgreSQL\\[versión]\\bin\\pg_dump.exe'
        );
      }

      this.logger.log(`Usando pg_dump de: ${pgDumpPath}`);

      // Crear archivo .pgpass temporal para autenticación
      const pgpassPath = path.join(this.backupDir, '.pgpass');
      const pgpassContent = `${dbConfig.host}:${dbConfig.port}:${dbConfig.database}:${dbConfig.user}:${dbConfig.password}`;
      fs.writeFileSync(pgpassPath, pgpassContent, { mode: 0o600 });

      const command = `"${pgDumpPath}" -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${filepath}"`;

      try {
        await execAsync(command, {
          env: {
            ...process.env,
            PGPASSWORD: dbConfig.password,
            PGPASSFILE: pgpassPath,
          },
        });
      } finally {
        // Eliminar archivo .pgpass después de usarlo
        if (fs.existsSync(pgpassPath)) {
          fs.unlinkSync(pgpassPath);
        }
      }

      this.logger.log(`Backup generado exitosamente: ${filename}`);
      return filepath;
    } catch (error) {
      this.logger.error('Error al generar backup:', error);
      throw error;
    }
  }

  /**
   * Sube el backup a Google Drive
   */
  async subirAGoogleDrive(filepath: string): Promise<string> {
    try {
      this.logger.log('Subiendo backup a Google Drive...');

      const credentialsPath = this.configService.get<string>(
        'GOOGLE_OAUTH_CREDENTIALS_PATH',
      );
      const tokenPath =
        this.configService.get<string>('GOOGLE_TOKEN_PATH') ||
        './google-token.json';
      const folderId = this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID');

      if (!credentialsPath || !folderId) {
        throw new Error('Configuración de Google Drive incompleta');
      }

      // Leer credenciales OAuth
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
      const { client_secret, client_id, redirect_uris } =
        credentials.installed || credentials.web;

      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0],
      );

      // Intentar cargar token guardado
      if (fs.existsSync(tokenPath)) {
        const token = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
        oAuth2Client.setCredentials(token);
      } else {
        throw new Error(
          'Token de Google Drive no encontrado. Ejecuta el endpoint /backup/autorizar-google primero.',
        );
      }

      const drive = google.drive({ version: 'v3', auth: oAuth2Client });

      const fileMetadata = {
        name: path.basename(filepath),
        parents: [folderId],
      };

      const media = {
        mimeType: 'application/sql',
        body: fs.createReadStream(filepath),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink',
        supportsAllDrives: true,
      });

      this.logger.log(`Backup subido a Google Drive: ${response.data.name}`);

      // Eliminar archivo local después de subirlo (opcional)
      fs.unlinkSync(filepath);

      return response.data.webViewLink || 'URL no disponible';
    } catch (error) {
      this.logger.error('Error al subir a Google Drive:', error);
      throw error;
    }
  }

  /**
   * Ejecuta backup completo (generar + subir)
   */
  async ejecutarBackupCompleto(): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      const filepath = await this.generarBackup();
      const driveUrl = await this.subirAGoogleDrive(filepath);

      return {
        success: true,
        url: driveUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Limpia backups LOCALES antiguos (mantener solo los últimos N)
   * NOTA: Los backups en Google Drive NO se eliminan, solo los archivos locales temporales
   */
  async limpiarBackupsLocalesAntiguos(
    mantener: number = 10,
  ): Promise<{ eliminados: number; mantenidos: number }> {
    try {
      const files = fs
        .readdirSync(this.backupDir)
        .filter((file) => file.endsWith('.sql'))
        .map((file) => ({
          name: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      const totalFiles = files.length;
      let eliminados = 0;

      // Eliminar solo los backups LOCALES más antiguos
      // Los de Google Drive permanecen intactos
      if (files.length > mantener) {
        for (let i = mantener; i < files.length; i++) {
          fs.unlinkSync(files[i].path);
          eliminados++;
          this.logger.log(`Backup LOCAL antiguo eliminado: ${files[i].name}`);
        }
      }

      this.logger.log(
        `Limpieza completada: ${eliminados} archivos eliminados, ${mantener} mantenidos`,
      );
      this.logger.log(
        'IMPORTANTE: Los backups en Google Drive NO fueron afectados',
      );

      return {
        eliminados,
        mantenidos: totalFiles - eliminados,
      };
    } catch (error) {
      this.logger.error('Error al limpiar backups locales antiguos:', error);
      throw error;
    }
  }

  /**
   * Lista todos los backups locales disponibles
   */
  async listarBackupsLocales(): Promise<
    Array<{ nombre: string; fecha: Date; tamano: number }>
  > {
    try {
      const files = fs
        .readdirSync(this.backupDir)
        .filter((file) => file.endsWith('.sql'))
        .map((file) => {
          const filepath = path.join(this.backupDir, file);
          const stats = fs.statSync(filepath);
          return {
            nombre: file,
            fecha: stats.mtime,
            tamano: stats.size,
          };
        })
        .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

      return files;
    } catch (error) {
      this.logger.error('Error al listar backups locales:', error);
      throw error;
    }
  }

  /**
   * Busca pg_dump en las instalaciones de PostgreSQL disponibles
   */
  private async findPgDump(): Promise<string | null> {
    const possiblePaths = [
      // Buscar en Program Files para versiones 12-20
      ...Array.from({ length: 9 }, (_, i) => 
        `C:\\Program Files\\PostgreSQL\\${20 - i}\\bin\\pg_dump.exe`
      ),
      // Buscar en Program Files (x86)
      ...Array.from({ length: 9 }, (_, i) => 
        `C:\\Program Files (x86)\\PostgreSQL\\${20 - i}\\bin\\pg_dump.exe`
      ),
    ];

    // Buscar en PATH
    try {
      const { stdout } = await execAsync('where pg_dump', { 
        windowsHide: true 
      });
      if (stdout.trim()) {
        const pathFromWhere = stdout.trim().split('\n')[0].trim();
        if (fs.existsSync(pathFromWhere)) {
          this.logger.log(`pg_dump encontrado en PATH: ${pathFromWhere}`);
          return pathFromWhere;
        }
      }
    } catch (error) {
      // No está en PATH, continuar con otras ubicaciones
    }

    // Buscar en ubicaciones comunes
    for (const pgPath of possiblePaths) {
      if (fs.existsSync(pgPath)) {
        this.logger.log(`pg_dump encontrado: ${pgPath}`);
        return pgPath;
      }
    }

    return null;
  }

  /**
   * Genera URL de autorización para Google Drive
   */
  async generarUrlAutorizacion(): Promise<string> {
    const credentialsPath = this.configService.get<string>(
      'GOOGLE_OAUTH_CREDENTIALS_PATH',
    );

    if (!credentialsPath) {
      throw new Error('GOOGLE_OAUTH_CREDENTIALS_PATH no configurado');
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    const { client_secret, client_id, redirect_uris } =
      credentials.installed || credentials.web;

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
    });

    return authUrl;
  }

  /**
   * Guarda el token de autorización
   */
  async guardarTokenAutorizacion(code: string): Promise<void> {
    const credentialsPath = this.configService.get<string>(
      'GOOGLE_OAUTH_CREDENTIALS_PATH',
    );
    const tokenPath =
      this.configService.get<string>('GOOGLE_TOKEN_PATH') ||
      './google-token.json';

    if (!credentialsPath) {
      throw new Error('GOOGLE_OAUTH_CREDENTIALS_PATH no configurado');
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    const { client_secret, client_id, redirect_uris } =
      credentials.installed || credentials.web;

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(tokenPath, JSON.stringify(tokens));
    this.logger.log('Token de Google Drive guardado exitosamente');
  }

  /**
   * Parsea la URL de la base de datos
   */
  private parseDatabaseUrl(url: string) {
    const regex = /postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
    const match = url.match(regex);

    if (!match) {
      throw new Error('URL de base de datos inválida');
    }

    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: match[4],
      database: match[5],
    };
  }
}
