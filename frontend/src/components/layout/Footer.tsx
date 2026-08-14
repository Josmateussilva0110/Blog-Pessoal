import { SITE } from "@/config/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-4 pb-6 mt-20">
      <div className="mx-auto max-w-4xl glass rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-text-subtle">
          © {year} {SITE.name}
        </p>
        <div className="flex gap-6">
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-accent transition-colors"
          >
            GitHub
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted hover:text-accent transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
