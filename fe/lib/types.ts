export enum UserRole {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
} 