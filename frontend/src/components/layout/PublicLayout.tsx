import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { ProjectTransitionProvider } from "@/features/projects/context/ProjectTransitionProvider";
import { IosNavPage } from "./IosNavPage";
import { PAGE_WIDTH_CLASS } from "@/components/layout/pageWidth";
import { cn } from "@/lib/cn";

export function PublicLayout() {

  return (
    <ProjectTransitionProvider>
      <div className="min-h-dvh flex flex-col relative">
        {/* Fundo liso do novo visual */}
        <div className="fixed inset-0 -z-10 bg-home-bg" aria-hidden />
        <Header />
        <main className={cn("flex-1 mx-auto w-full px-4 sm:px-6 ios-nav-main", PAGE_WIDTH_CLASS)}>
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
