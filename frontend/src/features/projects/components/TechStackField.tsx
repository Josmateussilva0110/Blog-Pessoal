import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { splitCommaList } from "@/lib/slugify";

type TechStackFieldProps = {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
};

/**
 * Tecnologias digitadas separadas por vírgula. O texto fica em estado local para a
 * digitação não ser reformatada a cada tecla; o form recebe a lista já separada.
 */
export function TechStackField({ value, onChange, error }: TechStackFieldProps) {
  const [text, setText] = useState(() => value.join(", "));

  return (
    <Input
      label="Stack"
      placeholder="React, Node.js, Supabase"
      value={text}
      error={error}
      onChange={(event) => {
        setText(event.target.value);
        onChange(splitCommaList(event.target.value));
      }}
    />
  );
}
