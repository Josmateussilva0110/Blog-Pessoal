import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BackgroundOrbs } from "./BackgroundOrbs";
import { ProjectTransitionProvider } from "@/features/projects/context/ProjectTransitionProvider";

export function PublicLayout() {
  return (
    <ProjectTransitionProvider>
      <div className="min-h-dvh flex flex-col relative">
        <BackgroundOrbs />
        <Header />
        <main className="flex-1 mx-auto w-full max-w-6xl px-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ProjectTransitionProvider>
  );
}
