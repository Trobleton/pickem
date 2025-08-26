import { TParticipant } from "@/types/competiton";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

export default function SortableParticipant({
  data,
  disabled,
}: {
  data: TParticipant;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(data.contestant_id),
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // Completely hide the original when dragging
  };

  return (
    <Button
      variant="secondary"
      size="lg"
      className={cn(
        "w-full max-w-[178px] text-left truncate flex px-2 flex-row gap-2 justify-start cursor-grab active:cursor-grabbing",
        disabled && "cursor-default active:cursor-default",
      )}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <Avatar className="rounded-sm">
        <AvatarImage
          src={data.tierlist_image}
          alt={data.display_name}
          height={32}
          width={32}
        />
        <AvatarFallback>
          {data.display_name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {data.display_name}
    </Button>
  );
}

