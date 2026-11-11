import { Orbs } from "@/components/public/Orbs";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { getSiteContent } from "@/lib/supabase/queries";

export const revalidate = 300;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { vehicle } = await getSiteContent();
  return (
    <div className="relative min-h-screen overflow-hidden bg-prussian">
      <a href="#main" className="sr-only-focusable pill absolute left-4 top-4 z-50 bg-lemon text-black">
        Skip to content
      </a>
      <Orbs />
      <SiteHeader category={vehicle.category} />
      <main id="main" className="relative z-10">
        {children}
      </main>
      <SiteFooter instagram={vehicle.instagram} installer={vehicle.installer} />
    </div>
  );
}
