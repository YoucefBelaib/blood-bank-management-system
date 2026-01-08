export interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  password: string | null;
  address: string | null;
  contactPerson: string | null;
  status: string;
  createdAt: Date;
}

export interface HospitalDTO {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  address: string | null;
  contactPerson: string | null;
  status: string;
  createdAt: Date;
}

export interface CreateHospitalInput {
  name: string;
  location: string;
  phone: string;
  email: string;
  password?: string | null;
  address?: string | null;
  contactPerson?: string | null;
}

export function toHospitalDTO(hospital: Hospital): HospitalDTO {
  return {
    id: hospital.id,
    name: hospital.name,
    location: hospital.location,
    phone: hospital.phone,
    email: hospital.email,
    address: hospital.address,
    contactPerson: hospital.contactPerson,
    status: hospital.status,
    createdAt: hospital.createdAt,
  };
}
