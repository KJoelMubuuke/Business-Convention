export type Role = "system_admin" | "supervisor" | "registerer";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
}

export interface Convention {
  id: string;
  year: number;
  title: string;
  fee_resident: number;
  fee_non_resident: number;
  is_active: boolean;
}

export type Gender = "Male" | "Female";
export type Residency = "Resident" | "Non-Resident";
export type PaymentMethod = "Cash" | "MoMo" | "Bank" | "Waived";

export interface Attendee {
  id: string;
  convention_id: string;
  created_at: string;
  created_by: string;
  full_name: string;
  occupation: string;
  district: string;
  church: string;
  gender: Gender;
  residency: Residency;
  amount_paid: number;
  payment_method: PaymentMethod;
  phone: string;
  notes: string;
  checked_in_at: string | null;
}

export type LookupCategory = "district" | "church" | "occupation";

export interface Lookup {
  id: string;
  category: LookupCategory;
  value: string;
}

export interface Lookups {
  district: string[];
  church: string[];
  occupation: string[];
}
