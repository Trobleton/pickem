"use client";

import { TCompetition, TParticipant } from "@/types/competiton";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import React, { useState, useMemo, useCallback } from "react";
import { Droppable } from "./droppable";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Participant from "./participant";
import SortableParticipant from "./sortable-participant";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "../ui/button";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

export default function Pickem({
  data,
  preloadedPicks,
  eventId,
  userId,
}: {
  data: TCompetition;
  preloadedPicks: Preloaded<typeof api.picks.getCurrentEventPicks>;
  userId: Id<"users">;
  eventId: Id<"events">;
}) {
  const lockIn = useMutation(api.picks.lockIn);
  const userPicks = usePreloadedQuery(preloadedPicks);

  const [showParticipants, setShowParticipants] = useState(true);

  const roundContainers = ["round-1", "round-2", "round-3", "round-4"] as const;
  const participantContainer = "participants";

  const maxParticipantsPerRound = {
    "round-1": 20, // 30-11
    "round-2": 8, // 10-3
    "round-3": 1, // 2
    "round-4": 1, // 1
  };

  const roundPlacements = {
    "round-1": "30th - 11th",
    "round-2": "10th - 3rd",
    "round-3": "2nd",
    "round-4": "1st",
  };

  const getPlacementNumber = (container: string, index: number) => {
    switch (container) {
      case "round-1":
        return 11 + index;
      case "round-2":
        return 3 + index;
      case "round-3":
        return 2;
      case "round-4":
        return 1;
      default:
        return null;
    }
  };

  const [picks, setPicks] = useState<Record<string, TParticipant[]>>(() => {
    const initialPicks: Record<string, TParticipant[]> = {
      [participantContainer]: data,
      "round-1": [],
      "round-2": [],
      "round-3": [],
      "round-4": [],
    };
    return initialPicks;
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3, // 3px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainer = findContainerInState(activeId, picks);
    const overContainer = findContainerInState(overId, picks);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return; // Let sortable handle same-container moves
    }

    // Only handle cross-container moves during drag
    // Check capacity
    if (
      roundContainers.includes(
        overContainer as keyof typeof maxParticipantsPerRound,
      )
    ) {
      const maxAllowed =
        maxParticipantsPerRound[
          overContainer as keyof typeof maxParticipantsPerRound
        ];
      if (picks[overContainer].length >= maxAllowed) {
        return;
      }
    }

    setPicks((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex(
        (item) => String(item.contestant_id) === activeId,
      );

      // Don't move if already moved
      if (activeIndex === -1) return prev;

      const activeItem = activeItems[activeIndex];

      let overIndex: number;
      if ([...roundContainers, participantContainer].includes(overId)) {
        overIndex = overItems.length;
      } else {
        const participantIndex = overItems.findIndex(
          (item) => String(item.contestant_id) === overId,
        );
        overIndex =
          participantIndex !== -1 ? participantIndex + 1 : overItems.length;
      }

      return {
        ...prev,
        [activeContainer]: activeItems.filter(
          (item) => String(item.contestant_id) !== activeId,
        ),
        [overContainer]: [
          ...overItems.slice(0, overIndex),
          activeItem,
          ...overItems.slice(overIndex),
        ],
      };
    });
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const activeContainer = findContainerInState(activeId, picks);
      const overContainer = findContainerInState(overId, picks);

      if (!activeContainer) return;

      if (activeContainer === overContainer) {
        // Same container reordering (sortable handles this automatically)
        setPicks((prev) => {
          const items = prev[activeContainer];
          const oldIndex = items.findIndex(
            (item) => String(item.contestant_id) === activeId,
          );
          const newIndex = items.findIndex(
            (item) => String(item.contestant_id) === overId,
          );

          if (oldIndex !== -1 && newIndex !== -1) {
            return {
              ...prev,
              [activeContainer]: arrayMove(items, oldIndex, newIndex),
            };
          }
          return prev;
        });
      }
      // Cross-container moves already handled in handleDragOver
    },
    [picks],
  );

  function findContainerInState(
    id: string,
    state: Record<string, TParticipant[]>,
  ) {
    if (id in state) {
      return id;
    }

    for (const [containerId, items] of Object.entries(state)) {
      if (items.find((item) => String(item.contestant_id) === id)) {
        return containerId;
      }
    }
  }

  const activeParticipant = useMemo(() => {
    if (!activeId) return null;
    for (const participants of Object.values(picks)) {
      const participant = participants.find(
        (p) => String(p.contestant_id) === activeId,
      );
      if (participant) return participant;
    }
    return null;
  }, [activeId, picks]);

  function handleSubmit() {
    const allRoundsFilled = roundContainers.every(
      (round) => picks[round].length === maxParticipantsPerRound[round],
    );

    if (!allRoundsFilled) {
      alert(
        "Please ensure all rounds are completely filled before submitting.",
      );
      return;
    }

    // flatten picks into an array of contest ids
    const round1 = picks["round-1"];
    const round2 = picks["round-2"];
    const round3 = picks["round-3"];
    const round4 = picks["round-4"];
    const managedPicks = [round4, round3, round2, round1];
    const flattedPicks = managedPicks.flat().map((p) => p.contestant_id);

    lockIn({
      userId,
      eventId,
      picks: flattedPicks,
    });
  }

  return (
    <div className="max-w-5xl space-y-4 flex flex-col gap-4 mx-auto">
      <Button
        disabled={!!userPicks}
        onClick={handleSubmit}
        className="w-fit ml-auto"
      >
        Lock In Picks
      </Button>

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          {roundContainers.map((round, index) => (
            <Droppable key={round} id={round}>
              <Card className="p-4">
                <CardHeader className="p-0">
                  <CardTitle>{roundPlacements[round]}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {picks[round]?.length || 0}/{maxParticipantsPerRound[round]}{" "}
                    selected
                  </div>
                </CardHeader>
                <CardContent className="px-0 space-y-2">
                  <SortableContext
                    items={
                      picks[round]?.map((p) => String(p.contestant_id)) || []
                    }
                    strategy={verticalListSortingStrategy}
                  >
                    {picks[round]?.map((participant, participantIndex) => (
                      <div
                        key={participant.contestant_id}
                        className="flex items-center min-w-0 gap-2"
                      >
                        <span className="text-sm font-mono w-6">
                          {getPlacementNumber(round, participantIndex)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <SortableParticipant data={participant} />
                        </div>
                      </div>
                    ))}
                  </SortableContext>
                </CardContent>
              </Card>
            </Droppable>
          ))}
        </div>

        <div
          className={cn(
            "sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border pt-4",
          )}
        >
          <Button
            size="icon"
            variant="link"
            className="absolute -top-8 left-0 right-0 mx-auto -z-10"
            onClick={() => setShowParticipants((prev) => !prev)}
          >
            <ChevronUp
              className={cn(
                "transition-transform",
                showParticipants ? "rotate-0" : "rotate-180",
              )}
            />
          </Button>

          <div
            className={cn(
              "transition-transform overflow-hidden",
              showParticipants ? "max-h-fit" : "max-h-24 mask-b-from-25%",
            )}
          >
            <Droppable id={participantContainer}>
              <div className="flex flex-wrap gap-4 min-h-32 justify-center">
                <SortableContext
                  items={
                    picks[participantContainer]?.map((p) =>
                      String(p.contestant_id),
                    ) || []
                  }
                  strategy={verticalListSortingStrategy}
                >
                  {picks[participantContainer]?.map((participant) => (
                    <SortableParticipant
                      data={participant}
                      key={participant.contestant_id}
                    />
                  ))}
                  {picks[participantContainer]?.length === 0 && (
                    <div className="text-muted-foreground text-center py-8 col-span-4">
                      Drop participants here
                    </div>
                  )}
                </SortableContext>
              </div>
            </Droppable>
          </div>
        </div>

        <DragOverlay>
          {activeParticipant ? <Participant data={activeParticipant} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
