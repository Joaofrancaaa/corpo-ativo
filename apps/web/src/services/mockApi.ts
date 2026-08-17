import type { Plan, PreRegistrationUser } from '../interfaces/types';

const mockPlans: Plan[] = [
  {
    id: 'plan_1',
    name: 'Mensal',
    price: 119.9,
    billingCycle: 'monthly',
    features: ['Acesso livre', 'Musculação', 'Aulas coletivas'],
  },
  {
    id: 'plan_2',
    name: 'Anual',
    price: 89.9,
    billingCycle: 'yearly',
    features: [
      'Acesso livre',
      'Musculação',
      'Aulas coletivas',
      'Sem taxa de adesão',
      'Convide 1 amigo por mês',
    ],
    isPopular: true,
  },
  {
    id: 'plan_3',
    name: 'Trimestral',
    price: 109.9,
    billingCycle: 'quarterly',
    features: ['Acesso livre', 'Musculação', 'Aulas coletivas'],
  },
];

export const getPlans = async (): Promise<Plan[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPlans);
    }, 800);
  });
};

export const submitPreRegistration = async (
  user: PreRegistrationUser,
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Dados recebidos no backend simulado:', user);
      resolve({
        success: true,
        message: 'Pré-matrícula realizada com sucesso!',
      });
    }, 1200);
  });
};
