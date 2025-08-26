import { TParticipant } from '@/types/competiton';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


export default function Participant({ data }: { data: TParticipant }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: data.contestant_id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Button
            variant="secondary"
            size="lg"
            className="w-full max-w-[178px] text-left truncate flex px-2 flex-row gap-2 justify-start cursor-grab active:cursor-grabbing"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
        >
            <Avatar className="rounded-sm">
                <AvatarImage src={data.tierlist_image} alt={data.display_name} />
                <AvatarFallback>{data.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {data.display_name}
        </Button>
    );
}