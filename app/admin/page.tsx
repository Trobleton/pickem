import AdminEvents from "./_components/events";
import AdminLeaderboard from "./_components/leaderboard";

export default function AdminPage() {
  return (
    <main className="max-w-6xl mx-auto flex flex-col gap-4 p-4">
      <div className="w-full mx-auto grid grid-cols-12 gap-4">
        <AdminLeaderboard className="col-span-full lg:col-span-6" />
        <AdminEvents className="col-span-full lg:col-span-6" />
      </div>
    </main>
  );
}
