import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useSubmitShortcut } from "@/hooks/useSubmitShortcut";
import { cn } from "@/lib/cn";
import { formatDate, formatTime } from "@/lib/format";
import type { Note } from "@/lib/types";
import { MOD_LABEL } from "@/lib/shortcuts";
import { noteSchema, type NoteValues } from "../schemas";

interface NoteFormProps {
  notes: Note[];
  onSave: (texto: string) => void;
}

export function NoteForm({ notes, onSave }: NoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteValues>({ resolver: zodResolver(noteSchema), defaultValues: { texto: "" } });

  useSubmitShortcut(formRef);

  const submit = handleSubmit(({ texto }) => {
    onSave(texto);
    reset();
  });

  return (
    <div className="flex flex-col gap-3">
      <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-2">
        <TextAreaField
          label="Nota"
          rows={4}
          data-first-field
          placeholder="Qué pasó en la gestión"
          error={errors.texto?.message}
          {...register("texto")}
        />
        <Button type="submit" variant="primary" className="self-end">
          Guardar nota
          <Kbd tone="onAccent">{MOD_LABEL}+Enter</Kbd>
        </Button>
      </form>
      {notes.length > 0 ? (
        <ul className="flex flex-col divide-y divide-line-subtle border-t border-line-subtle" aria-label="Notas del caso">
          {notes.map((note) => (
            <li
              key={note.id}
              className={cn(
                "flex flex-col gap-0.5 py-2",
                note.origen === "agenda" && "my-1 rounded-sm border border-info-border bg-info-subtle px-2",
              )}
            >
              <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-fg-muted">
                {note.origen === "agenda" ? (
                  <span className="inline-flex items-center gap-1 font-sans font-medium text-info">
                    <CalendarCheck className="size-3.5" strokeWidth={1.75} aria-hidden />
                    Agenda resuelta
                  </span>
                ) : null}
                {formatDate(note.creada)} {formatTime(note.creada)}
              </span>
              <p className="text-sm leading-5 whitespace-pre-wrap text-fg-secondary">{note.texto}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-fg-muted">Todavía no hay notas.</p>
      )}
    </div>
  );
}
