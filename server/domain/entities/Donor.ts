export interface Donor {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  bloodType: string;
  location: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateDonorInput {
  fullName: string;
  age: number;
  gender: string;
  bloodType: string;
  location: string;
  phone: string;
  email: string;
}
