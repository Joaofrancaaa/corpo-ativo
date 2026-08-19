import AppRoutes from '@/routes/AppRoutes';
import { useScrollReveal } from '@/features/scrollReveal/useScrollReveal';

export default function App() {
  useScrollReveal();

  return <AppRoutes />;
}
