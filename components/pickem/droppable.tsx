import { useDroppable } from "@dnd-kit/core";

export function Droppable({
  id,
  children,
  disabled,
}: {
  id: string;
  children: React.ReactNode;
  disabled: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return <div ref={setNodeRef}>{children}</div>;
}

