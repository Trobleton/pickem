import { TParticipant } from '@/types/competiton';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/button';

export default function SortableParticipant({ data }: { data: TParticipant }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: String(data.user_id),
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
            className="w-full text-left truncate block justify-start cursor-grab active:cursor-grabbing"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
        >
            {data.display_name}
        </Button>
    );
}