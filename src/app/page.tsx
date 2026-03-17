
import { KMLGenerator } from '@/components/kml-generator';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <KMLGenerator />
      <Toaster />
    </main>
  );
}
