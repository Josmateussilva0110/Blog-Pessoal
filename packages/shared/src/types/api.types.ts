/** Listas da API: itens e paginação dentro de data, sem campo novo no envelope */
export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

export type PaginatedList<T> = {
  items: T[];
  pagination: Pagination;
};

/** Resposta de create/update: só o id, o cliente já tem os demais campos */
export type CreatedId = {
  id: string;
};
