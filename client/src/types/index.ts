// User types
export interface User {
  id: string;
  username: string;
  approved?: boolean;
}

// Donor types
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
  createdAt: string;
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

// Hospital types
export interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  address?: string | null;
  contactPerson?: string | null;
  status: string;
  createdAt: string;
}

export interface CreateHospitalInput {
  name: string;
  location: string;
  phone: string;
  email: string;
  password: string;
  address?: string;
  contactPerson?: string;
}

// Blood Request types
export interface BloodRequest {
  id: string;
  hospitalId?: string | null;
  hospitalName: string;
  bloodType: string;
  unitsNeeded: number;
  urgencyLevel: string;
  location: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface CreateBloodRequestInput {
  hospitalName: string;
  bloodType: string;
  unitsNeeded: number;
  urgencyLevel: string;
  location: string;
  phone: string;
  email: string;
}

// Statistics types
export interface Statistics {
  id: string;
  activeDonors: number;
  totalBloodUnits: number;
  partnerHospitals: number;
  lastUpdated: string;
}

export interface BloodInventory {
  id: string;
  bloodType: string;
  unitsAvailable: number;
  status: string;
  lastUpdated: string;
}

export interface DashboardStats {
  donorsByBloodType: { name: string; value: number }[];
  donorsByLocation: { name: string; value: number }[];
  totalDonors: number;
  monthlyDonorStats: { month: string; thisYear: number; lastYear: number }[];
  totalHospitals: number;
  totalPending: number;
  pendingRequests: number;
  approvedRequests: number;
  statistics: Statistics | null;
  bloodInventory: BloodInventory[];
}

// API Response types
export interface ApiError {
  message: string;
  code?: string;
}

export interface LoginResponse {
  user: User;
}

export interface SignupResponse {
  user: User;
  message: string;
}
