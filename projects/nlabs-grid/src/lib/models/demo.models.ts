// Sample data models for demo
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  salary: number;
  department: string;
  city: string;
  country: string;
  phone: string;
  address: string;
  zipCode: string;
  jobTitle: string;
  manager: string;
  active: boolean;
  startDate: Date;
  registeredDate: Date;
  lastLogin: Date;
  notes: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}
