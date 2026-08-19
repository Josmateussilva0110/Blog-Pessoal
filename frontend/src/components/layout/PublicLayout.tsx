import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BackgroundOrbs } from "./BackgroundOrbs";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { ProjectTransitionProvider } from "@/features/projects/context/ProjectTransitionProvider";
import { IosNavPage } from "./IosNavPage";

export function PublicLayout() {
  return (
    <ProjectTransitionProvider>
      <div className="min-h-dvh flex flex-col relative">
        <BackgroundOrbs />
        <Header />
        <main className="flex-1 mx-auto w-full max-w-6xl px-6 ios-nav-main">
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
