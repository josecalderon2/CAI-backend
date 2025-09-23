export type Role = 'Admin' | 'P.A' | 'Orientador';

export interface AuthUser {
  // para distinguir de qué tabla viene
  tipo: 'ADMINISTRATIVO' | 'ORIENTADOR';
  id: number;
  email: string;
  nombre: string;
  role: Role; // 'Admin' | 'P.A' | 'Orientador'
}
