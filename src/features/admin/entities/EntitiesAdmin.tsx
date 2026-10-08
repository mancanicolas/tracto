import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useEntityCatalog } from "@/hooks/useEntityCatalog";
import { cn } from "@/lib/cn";
import { deleteEntity, saveEntity } from "./catalogApi";
import { DeleteEntityDialog } from "./DeleteEntityDialog";
import { EntityEditor } from "./EntityEditor";
import { createEmptyDraft, serializeDraft, toDraft, validateDraft, type EntityDraft } from "./entityDraft";

const NEW_ENTITY = "__nueva__";
const NOT_SYNCED_MESSAGE =
  "El catálogo compartido todavía no se cargó desde la base. Revisá la conexión y que supabase_entidades.sql esté ejecutado.";
const UNSAVED_MESSAGE = "Guardá o descartá los cambios antes de cambiar de entidad.";

export function EntitiesAdmin() {
  const catalog = useEntityCatalog();
  const names = useMemo(() => Object.keys(catalog).sort((a, b) => a.localeCompare(b, "es")), [catalog]);
  const [selected, setSelected] = useState<string | null>(null);
  const [edits, setEdits] = useState<EntityDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const isNew = selected === NEW_ENTITY;
  const savedEntity = selected && !isNew ? catalog[selected] : undefined;
  const savedDraft = useMemo<EntityDraft | null>(() => {
    if (isNew) return createEmptyDraft();
    return selected && savedEntity ? toDraft(selected, savedEntity) : null;
  }, [isNew, selected, savedEntity]);

  const draft = edits ?? savedDraft;
  const isDirty = Boolean(edits && savedDraft && serializeDraft(edits) !== serializeDraft(savedDraft));

  const select = (name: string) => {
    if (isDirty) {
      setError(UNSAVED_MESSAGE);
      return;
    }
    setSelected(name);
    setEdits(null);
    setError(null);
    setMessage("");
  };

  const save = async () => {
    if (!draft) return;
    if (!isNew && !draft.id) {
      setError(NOT_SYNCED_MESSAGE);
      return;
    }
    const problem = validateDraft(draft, names);
    if (problem) {
      setError(problem);
      return;
    }
    setIsSaving(true);
    setError(null);
    const result = await saveEntity(draft);
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSelected(draft.nombre.trim());
    setEdits(null);
    setMessage("Guardado para todos los usuarios");
  };

  const confirmDelete = async () => {
    const id = savedEntity?.id;
    if (!id) return;
    setIsDeleting(true);
    const result = await deleteEntity(id);
    setIsDeleting(false);
    setPendingDelete(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSelected(null);
    setEdits(null);
    setMessage("");
  };

  return (
    <div className="flex min-h-0 flex-1">
      <nav aria-label="Entidades" className="flex w-56 shrink-0 flex-col border-r border-line-subtle">
        <div className="border-b border-line-subtle p-2">
          <Button className="w-full" onClick={() => select(NEW_ENTITY)}>
            <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            Nueva entidad
          </Button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {isNew ? (
            <li>
              <button
                type="button"
                aria-pressed
                className="flex h-8 w-full items-center bg-row-selected px-3 text-left text-[13px] text-fg italic shadow-[inset_2px_0_0_var(--accent)]"
              >
                Nueva entidad
              </button>
            </li>
          ) : null}
          {names.map((name) => (
            <li key={name}>
              <button
                type="button"
                aria-pressed={name === selected}
                onClick={() => select(name)}
                title={name}
                className={cn(
                  "flex h-8 w-full items-center truncate px-3 text-left text-[13px] transition-colors duration-100 motion-reduce:transition-none",
                  name === selected
                    ? "bg-row-selected text-fg shadow-[inset_2px_0_0_var(--accent)]"
                    : "text-fg-secondary hover:bg-row-hover hover:text-fg",
                )}
              >
                <span className="truncate">{name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {draft ? (
        <EntityEditor
          key={selected ?? ""}
          draft={draft}
          isNew={isNew}
          isDirty={isDirty}
          isSaving={isSaving}
          error={error}
          message={message}
          onChange={(next) => {
            setEdits(next);
            setError(null);
            setMessage("");
          }}
          onNameChange={(nombre) => setEdits({ ...draft, nombre })}
          onSave={() => void save()}
          onDiscard={() => {
            setEdits(null);
            setError(null);
          }}
          onDelete={() => selected && setPendingDelete(selected)}
        />
      ) : (
        <p className="p-4 text-[13px] text-fg-muted">Elegí una entidad de la lista o creá una nueva.</p>
      )}

      <DeleteEntityDialog
        name={pendingDelete}
        isDeleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
