export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  isDefault: boolean
  ratio: number;
  created_at: string
  updated_at: string
}

export type LoftStatus = 'available' | 'occupied' | 'maintenance';

export interface Loft {
  id: string;
  name: string;
  address: string;
  description?: string;
  price_per_month: number;
  status: LoftStatus;
  owner_id: string;
  owner_name?: string;
  zone_area_id?: string | null;
  zone_area_name?: string;
  company_percentage: number;
  owner_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface ZoneArea {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LoftOwner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  ownership_type: 'company' | 'third_party';
  created_at: string;
  updated_at: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: Date; // Change to Date type
  assigned_to?: string;
  team_id?: string;
  loft_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description?: string;
  transaction_type: 'income' | 'expense';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  category?: string;
  loft_id?: string; // Add loft_id
  user_id?: string;
  currency_id?: string;
  currency_symbol?: string; // Add currency_symbol
  ratio_at_transaction?: number;
  equivalent_amount_default_currency?: number;
  created_at: string;
  updated_at: string;
}
