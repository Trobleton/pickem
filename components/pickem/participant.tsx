import { TParticipant } from '@/types/competiton';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


export default function Participant({ data }: { data: TParticipant }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: String(data.user_id),
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Button
            variant="secondary"
            size="lg"
            className="w-full justify-start cursor-grab active:cursor-grabbing"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
        >
            {data.display_name}
        </Button>
    );
}