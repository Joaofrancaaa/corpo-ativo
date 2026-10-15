export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'weekly' | 'daily';
  features: string[];
  isPopular?: boolean;
}

export interface PreRegistrationUser {
  name: string;
  email: string;
  whatsapp: string;
  selectedPlanId: string;
}
