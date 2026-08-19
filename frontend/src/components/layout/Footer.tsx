import { SITE } from "@/config/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 pb-8 mt-20 border-t border-border-subtle">
      <div className="mx-auto max-w-6xl py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs text-text-subtle">
          © {year} {SITE.name}
        </p>
        <div className="flex gap-6">
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            github
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            linkedin
          </a>
        </div>
      </div>
    </footer>
  );
}
