export type Role = 'USER' | 'ADMIN';

export type PetitionStatus = 'PENDING' | 'ACTIVE' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface User {
  id: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  email: string;
  phone?: string | null;
  role: Role;
}

export interface Petition {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  postalCode: string;
  settlement: string;
  category?: string;
  address: string;
  status: PetitionStatus;
  officialAnswer?: string | null;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    votes: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Activity{
  id: string;
  userName: string; 
  petitionTitle: string;
  petitionId: number;
  createdAt: string;
}