import { lazy, useState, type ComponentType } from "react";

/**
 * React.lazy com pré-carregamento. O lazy comum suspende no primeiro render mesmo com o
 * módulo já baixado (mostra o fallback por um instante); depois do preload, o componente
 * é renderizado direto. A escolha é fixada por instância para não trocar o tipo do
 * elemento (e remontar a página) se o preload terminar com ela já na tela.
 */
export function lazyWithPreload(load: () => Promise<{ default: ComponentType }>) {
  let loaded: ComponentType | undefined;
  const LazyComponent = lazy(load);

  // Nunca rejeita: falha de rede no pré-carregamento é ignorada (o render tenta de novo
  // pelo lazy e a tela de erro da rota assume se continuar falhando)
  const preload = () =>
    load().then(
      (module) => {
        loaded = module.default;
      },
      () => undefined,
    );

  // Só páginas de rota (sem props) usam isto hoje
  function PreloadableComponent() {
    const [Component] = useState(() => loaded ?? LazyComponent);
    return <Component />;
  }

  return { Component: PreloadableComponent, preload };
}
