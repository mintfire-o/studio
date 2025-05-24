// src/app/loading.tsx
import StylusTextAnimation from '@/components/stylus-text-animation';

export default function Loading() {
  // This is the default loading UI for page navigations in Next.js App Router
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background">
      <StylusTextAnimation />
    </div>
  );
}
