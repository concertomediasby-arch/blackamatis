import { ContentProvider } from "@/components/public/ContentProvider";
import { EditModeProvider } from "@/components/public/EditMode";
import { LightboxProvider } from "@/components/public/Lightbox";
import { Orbs } from "@/components/public/Orbs";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContentProvider>
      <EditModeProvider>
      <LightboxProvider>
      <div className="relative min-h-screen overflow-hidden bg-prussian">
        <a href="#main" className="sr-only-focusable pill absolute left-4 top-4 z-50 bg-lemon text-black">
          Skip to content
        </a>
        <Orbs />
        <SiteHeader />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <SiteFooter />
      </div>
      </LightboxProvider>
      </EditModeProvider>
    </ContentProvider>
  );
}
