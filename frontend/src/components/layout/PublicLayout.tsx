import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BackgroundOrbs } from "./BackgroundOrbs";

export function PublicLayout() {
  return (
    <div className="min-h-dvh flex flex-col relative">
      <BackgroundOrbs />
      <Header />
      <main className="flex-1 mx-auto w-full max-w-4xl px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
