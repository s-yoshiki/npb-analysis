import { AppShell } from "@/components/app-shell";
import { PlayerDetail } from "@/components/player/player-detail";

export const metadata = {
  title: "Player | NPB Analysis",
};

export default function PlayerDetailPage() {
  return (
    <AppShell label="Player File">
      <PlayerDetail />
    </AppShell>
  );
}
