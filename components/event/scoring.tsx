import { InfoIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { cn } from "@/lib/utils";

export default function EventScoring({ className }: { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn("size-fit p-2 hover:cursor-pointer", className)}
          title="Leaderboard Scoring Info"
        >
          <InfoIcon size={14} />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leaderboard Scoring</DialogTitle>

          <div className="text-sm space-y-2">
            <p>A perfect pick would total 205 points.</p>
            <ul className="list-disc list-inside">
              <li>
                <strong>4 points</strong> per correct ranking (120 points)
              </li>
              <li>
                <strong>2 points</strong> per correct bracket (60 points)
              </li>
              <li>
                <strong>5 points</strong> per correct top 5 (25 points)
              </li>
            </ul>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
