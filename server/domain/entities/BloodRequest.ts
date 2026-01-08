export interface BloodRequest {
  id: string;
  hospitalId: string | null;
  hospitalName: string;
  bloodType: string;
  unitsNeeded: number;
  urgencyLevel: string;
  location: string;
  phone: string;
  email: string;
  status: string;
  createdAt: Date;
}

export interface CreateBloodRequestInput {
  hospitalId?: string | null;
  hospitalName: string;
  bloodType: string;
  unitsNeeded: number;
  urgencyLevel: string;
  location: string;
  phone: string;
  email: string;
}
