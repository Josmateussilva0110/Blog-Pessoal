/** Separa os arquivos aceitos (formato e tamanho) dos recusados, antes da prévia e do envio */
export function partitionImageFiles(
  files: File[],
  { mimeTypes, maxBytes }: { mimeTypes: readonly string[]; maxBytes: number },
) {
  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of files) {
    // O accept do input é só uma sugestão: dá para escolher "Todos os arquivos"
    if (mimeTypes.includes(file.type) && file.size <= maxBytes) accepted.push(file);
    else rejected.push(file);
  }

  return { accepted, rejected };
}
