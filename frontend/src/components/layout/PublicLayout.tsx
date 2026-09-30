import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BackgroundOrbs } from "./BackgroundOrbs";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { ProjectTransitionProvider } from "@/features/projects/context/ProjectTransitionProvider";
import { IosNavPage } from "./IosNavPage";
import { usePageWidthClass } from "@/hooks/usePageWidth";
import { cn } from "@/lib/format";

export function PublicLayout() {
  const pageWidth = usePageWidthClass();

  return (
    <ProjectTransitionProvider>
      <div className="min-h-dvh flex flex-col relative">
        <BackgroundOrbs />
        <Header />
        <main className={cn("flex-1 mx-auto w-full px-4 sm:px-6 ios-nav-main", pageWidth)}>
          <IosNavPage>
            <Outlet />
          </IosNavPage>
        </main>
        <Footer />
        <ScrollToTopButton threshold={0.7} />
      </div>
    </ProjectTransitionProvider>
  );
}
