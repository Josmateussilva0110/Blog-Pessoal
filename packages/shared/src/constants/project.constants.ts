/** Limites dos campos de projeto: os mesmos no formulário e na validação da API */
export const PROJECT_TITLE_MAX_LENGTH = 120;
export const PROJECT_SLUG_MAX_LENGTH = 120;
export const PROJECT_DESCRIPTION_MAX_LENGTH = 500;

/** Limites das atualizações (changelog) de um projeto */
export const PROJECT_UPDATE_TITLE_MAX_LENGTH = 120;
export const PROJECT_UPDATE_VERSION_MAX_LENGTH = 30;
export const PROJECT_UPDATE_CONTENT_MAX_LENGTH = 20000;
/** Faixa de anos aceita na data de publicação (barra datas digitadas erradas, como 0202) */
export const PROJECT_UPDATE_MIN_YEAR = 2000;
export const PROJECT_UPDATE_MAX_YEAR = 2100;
