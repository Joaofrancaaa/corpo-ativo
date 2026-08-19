import { Toaster } from 'sonner';
import AppRoutes from '@/routes/AppRoutes';
import { useScrollReveal } from '@/features/scrollReveal/useScrollReveal';

export default function App() {
  useScrollReveal();

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <AppRoutes />
    </>
  );
}
