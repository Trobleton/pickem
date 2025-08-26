'use client'

import { TCompetition } from "@/types/competiton"
import { DndContext, useDroppable, useDraggable, DragEndEvent, DragStartEvent, DragOverEvent, DragOverlay } from "@dnd-kit/core"
import { CSS } from '@dnd-kit/utilities';
import { useState } from "react";
import Image from "next/image";

type PickemProps = {
    data: TCompetition
}

export function Pickem({ data }: PickemProps) {
    const containers = ['round-1', 'round-2', 'round-3', 'round-4']
    const availableContainer = 'available'
    const roundLimits = {
        'round-1': 19,
        'round-2': 8,
        'round-3': 1,
        'round-4': 1
    }
    const roundPlacements = {
        'round-1': '30th - 11th',
        'round-2': '10th - 2nd',
        'round-3': '2nd',
        'round-4': '1st'
    }
    const getPlacementNumber = (container: string, index: number) => {
        switch (container) {
            case 'round-1': return 30 - index; // 30th, 29th, ..., 11th
            case 'round-2': return 10 - index; // 10th, ..., 3rd
            case 'round-3': return 2;
            case 'round-4': return 1;
            default: return null;
        }
    }
    const [roundParticipants, setRoundParticipants] = useState<Record<string, TCompetition[number][]>>({
        'round-1': [],
        'round-2': [],
        'round-3': [],
        'round-4': []
    })

    const [activeId, setActiveId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | null>(null)

    function handleDragStart(event: DragStartEvent) {
        setActiveId(String(event.active.id))
    }

    function handleDragOver(event: DragOverEvent) {
        setOverId(event.over ? String(event.over.id) : null)
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null)
        setOverId(null)

        if (over) {
            const draggedParticipant = data.find(p => p.display_name === String(active.id));
            if (draggedParticipant) {
                setRoundParticipants(prev => {
                    const newState = { ...prev };

                    // Remove participant from all rounds first
                    containers.forEach(container => {
                        newState[container] = newState[container].filter(p => p.display_name !== draggedParticipant.display_name);
                    });

                    const overId = String(over.id);

                    // Check if dropped on a participant (for replacement)
                    if (overId.startsWith('participant-')) {
                        const targetParticipantName = overId.replace('participant-', '');

                        // Find which round the target participant is in
                        const targetRound = containers.find(container =>
                            newState[container].some(p => p.display_name === targetParticipantName)
                        );

                        if (targetRound) {
                            // Replace the target participant with the dragged one
                            const targetIndex = newState[targetRound].findIndex(p => p.display_name === targetParticipantName);
                            if (targetIndex !== -1) {
                                newState[targetRound][targetIndex] = draggedParticipant;
                                // The replaced participant becomes available (removed from rounds)
                            }
                        }
                    }
                    // If dropped on a round container, add to that round (if within limit)
                    else if (containers.includes(overId)) {
                        const currentCount = newState[overId].length;
                        const limit = roundLimits[overId as keyof typeof roundLimits];

                        if (currentCount < limit) {
                            newState[overId] = [...newState[overId], draggedParticipant];
                        } else {
                            // If limit exceeded, add back to original position
                            const originalRound = containers.find(container =>
                                prev[container].some(p => p.display_name === draggedParticipant.display_name)
                            );
                            if (originalRound) {
                                newState[originalRound] = [...newState[originalRound], draggedParticipant];
                            }
                        }
                    }
                    // If dropped on available area, participant stays removed from rounds (available)

                    return newState;
                });
            }
        }
    }

    const activeParticipant = activeId ? data.find(p => p.display_name === activeId) : null

    return (
        <div className="flex flex-col gap-4 m-4">
            <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-4 gap-4">
                    {containers.map(container => (
                        <PickemRound key={container} id={container}>
                            <div className="font-bold mb-2">
                                <div>{container} ({roundParticipants[container].length}/{roundLimits[container as keyof typeof roundLimits]})</div>
                                <div className="text-sm font-normal text-gray-400">
                                    {roundPlacements[container as keyof typeof roundPlacements]}
                                </div>
                            </div>
                            {roundParticipants[container].map((participant, index) => (
                                <PickemParticipantWithPreview
                                    key={`${container}-${participant.display_name}`}
                                    participant={participant}
                                    placement={getPlacementNumber(container, index)}
                                    isTarget={overId === `participant-${participant.display_name}` && activeId !== participant.display_name}
                                    previewParticipant={activeParticipant}
                                />
                            ))}
                        </PickemRound>
                    ))}
                </div>

                <PickemRound id={availableContainer}>
                    <div className="font-bold mb-2">Available Participants</div>
                    {data.filter(participant =>
                        !containers.some(container =>
                            roundParticipants[container].some(p => p.display_name === participant.display_name)
                        )
                    ).map(participant => (
                        <PickemParticipant key={participant.display_name} participant={participant} />
                    ))}
                </PickemRound>

                <button
                    onClick={() => console.log('Round Data:', roundParticipants)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Submit & Log Data
                </button>

                <DragOverlay>
                    {activeParticipant ? (
                        <div className="p-2 bg-neutral-700 w-fit flex items-center opacity-80">
                            <Image src={activeParticipant.tierlist_image} alt={activeParticipant.display_name} width={32} height={32} className="inline-block mr-2 size-8 rounded-md bg-neutral-300" />
                            {activeParticipant.display_name}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>

    )
}

function PickemRound({ id, children }: { id: string, children: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };
    return (
        <div ref={setNodeRef} style={style} className="p-4 bg-neutral-800 min-h-32 rounded">
            {children}
        </div>
    )
}

function PickemParticipantWithPreview({
    participant,
    placement,
    isTarget,
    previewParticipant
}: {
    participant: TCompetition[number],
    placement?: number | null,
    isTarget: boolean,
    previewParticipant?: TCompetition[number] | null
}) {
    const { attributes, listeners, setNodeRef: setDragRef, transform } = useDraggable({
        id: participant.display_name
    })

    const { isOver, setNodeRef: setDropRef } = useDroppable({
        id: `participant-${participant.display_name}`,
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    const dropStyle = isOver ? { backgroundColor: 'rgb(59 130 246)', opacity: 0.8 } : {};

    // Show preview when being targeted for replacement
    if (isTarget && previewParticipant) {
        return (
            <div
                ref={setDropRef}
                className="p-2 bg-green-600 w-fit flex items-center opacity-90 border-2 border-green-400"
            >
                {placement && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2 font-bold min-w-8 text-center">
                        {placement}
                    </span>
                )}
                <Image src={previewParticipant.tierlist_image} alt={previewParticipant.display_name} width={32} height={32} className="inline-block mr-2 size-8 rounded-md bg-neutral-300" />
                {previewParticipant.display_name}
            </div>
        )
    }

    return (
        <div
            ref={(node) => {
                setDragRef(node);
                setDropRef(node);
            }}
            style={{ ...style, ...dropStyle }}
            {...listeners}
            {...attributes}
            className="p-2 bg-neutral-700 w-fit flex items-center"
        >
            {placement && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2 font-bold min-w-8 text-center">
                    {placement}
                </span>
            )}
            <Image src={participant.tierlist_image} alt={participant.display_name} width={32} height={32} className="inline-block mr-2 size-8 rounded-md bg-neutral-300" />
            {participant.display_name}
        </div>
    )
}

function PickemParticipant({ participant, placement }: { participant: TCompetition[number], placement?: number | null }) {
    const { attributes, listeners, setNodeRef: setDragRef, transform } = useDraggable({
        id: participant.display_name
    })

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    return (
        <div
            ref={setDragRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-2 bg-neutral-700 w-fit flex items-center"
        >
            {placement && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2 font-bold min-w-8 text-center">
                    {placement}
                </span>
            )}
            <Image src={participant.tierlist_image} alt={participant.display_name} width={32} height={32} className="inline-block mr-2 size-8 rounded-md bg-neutral-300" />
            {participant.display_name}
        </div>
    )
}