import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminLeaderboardProps = {
  className?: string;
};

export default function AdminLeaderboard({ className }: AdminLeaderboardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>

      <CardContent></CardContent>
    </Card>
  );
}
