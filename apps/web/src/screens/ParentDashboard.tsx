import { useMemo } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@invana/ui';
import type { ReactNode } from 'react';
import { BarChart3, Gamepad2, Lightbulb, Star } from 'lucide-react';
import { AppShell } from '@kids/ui';
import { ScreenHeader } from '../components/ScreenHeader.js';
import { computeStats, formatDuration } from '@kids/gamification';
import { useProgress } from '@kids/storage';
import { gameMeta } from '../games/registry.js';

function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }): React.JSX.Element {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-extrabold">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

export function ParentDashboard(): React.JSX.Element {
  const sessions = useProgress((s) => s.sessions);
  const gamesStarted = useProgress((s) => s.gamesStarted);
  const clearSessions = useProgress((s) => s.clearSessions);

  // Stamp "now" once per render so day-bucketing is stable.
  const stats = useMemo(() => computeStats(sessions, Date.now(), gamesStarted), [sessions, gamesStarted]);
  const maxDayMs = Math.max(1, ...stats.last7Days.map((d) => d.timeMs));

  return (
    <AppShell
      header={
        <ScreenHeader
          title={
            <span className="inline-flex items-center gap-2">
              Parent Dashboard
              <BarChart3 className="h-6 w-6 shrink-0" strokeWidth={2.5} aria-hidden />
            </span>
          }
        />
      }
    >
      <div className="mx-auto max-w-3xl space-y-6 overflow-y-auto p-6">
        {stats.totalGames === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="flex items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              No games played yet. Come back after a few rounds!
              <Gamepad2 className="h-5 w-5 shrink-0" aria-hidden />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Focus time" value={formatDuration(stats.totalTimeMs)} hint="total time playing" />
              <StatCard label="Games played" value={`${stats.totalGames}`} hint={`${stats.wins} wins`} />
              <StatCard label="Win rate" value={`${Math.round(stats.winRate * 100)}%`} />
              <StatCard label="Avg / game" value={formatDuration(stats.avgTimeMs)} hint="average speed" />
              <StatCard label="Total tries" value={`${stats.totalRetries}`} hint={`${stats.avgRetries.toFixed(1)} avg`} />
              <StatCard label="Max tries (1 game)" value={`${stats.maxRetries}`} />
              <StatCard
                label="Hints used"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
                    {stats.totalHints}
                  </span>
                }
              />
              <StatCard label="Not finished" value={`${stats.abandoned}`} hint={`of ${stats.started} started`} />
              <StatCard
                label="Stars earned"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-5 w-5 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
                    {stats.totalStars}
                  </span>
                }
              />
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Last 7 days</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.last7Days.map((d) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs text-muted-foreground">{d.date.slice(5)}</span>
                    <Progress value={(d.timeMs / maxDayMs) * 100} className="h-3 flex-1" />
                    <span className="w-16 shrink-0 text-right text-xs">{formatDuration(d.timeMs)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>By game</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead className="text-right">Played</TableHead>
                      <TableHead className="text-right">Wins</TableHead>
                      <TableHead className="text-right">Avg time</TableHead>
                      <TableHead className="text-right">Tries</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.perGame.map((g) => {
                      const meta = gameMeta(g.gameId);
                      return (
                        <TableRow key={g.gameId}>
                          <TableCell className="font-semibold">
                            {meta ? `${meta.emoji} ${meta.label}` : g.gameId}
                          </TableCell>
                          <TableCell className="text-right">{g.games}</TableCell>
                          <TableCell className="text-right">{g.wins}</TableCell>
                          <TableCell className="text-right">{formatDuration(g.avgTimeMs)}</TableCell>
                          <TableCell className="text-right">{g.retries}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Recent rounds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.recent.map((s) => {
                  const meta = gameMeta(s.gameId);
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-1.5 font-semibold">
                        {meta ? (
                          <span aria-hidden>{meta.emoji}</span>
                        ) : (
                          <Gamepad2 className="h-4 w-4 shrink-0" aria-hidden />
                        )}
                        {meta?.label ?? s.gameId} · L{s.level}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span>{formatDuration(s.durationMs)}</span>
                        <span>{s.retries} tries</span>
                        <span className="flex items-center gap-1">
                          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                          {s.hints ?? 0}
                        </span>
                        <Badge variant={s.won ? 'default' : 'secondary'}>
                          {s.won ? (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                              {s.stars}
                            </span>
                          ) : (
                            'lost'
                          )}
                        </Badge>
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={clearSessions}>
                Reset stats
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
