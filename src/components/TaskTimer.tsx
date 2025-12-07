import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Clock } from "lucide-react";

interface TaskTimerProps {
  taskId: string;
  timerStatus: "stopped" | "running" | "paused";
  elapsedTime: number;
  timerStartedAt: string | null;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onStop: (id: string) => void;
}

export const TaskTimer = ({
  taskId,
  timerStatus,
  elapsedTime,
  timerStartedAt,
  onStart,
  onPause,
  onStop,
}: TaskTimerProps) => {
  const [displayTime, setDisplayTime] = useState(elapsedTime);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerStatus === "running" && timerStartedAt) {
      const startTime = new Date(timerStartedAt).getTime();
      
      interval = setInterval(() => {
        const now = Date.now();
        const additionalTime = Math.floor((now - startTime) / 1000);
        setDisplayTime(elapsedTime + additionalTime);
      }, 1000);
    } else {
      setDisplayTime(elapsedTime);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus, timerStartedAt, elapsedTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-sm font-mono min-w-[70px]">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className={timerStatus === "running" ? "text-primary font-semibold" : "text-foreground"}>
          {formatTime(displayTime)}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {timerStatus === "stopped" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/20 hover:text-primary"
            onClick={() => onStart(taskId)}
            title="Start"
          >
            <Play className="w-3.5 h-3.5" />
          </Button>
        )}

        {timerStatus === "running" && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/20 hover:text-accent"
              onClick={() => onPause(taskId)}
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
              onClick={() => onStop(taskId)}
              title="Stop"
            >
              <Square className="w-3.5 h-3.5" />
            </Button>
          </>
        )}

        {timerStatus === "paused" && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-primary/20 hover:text-primary"
              onClick={() => onStart(taskId)}
              title="Resume"
            >
              <Play className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
              onClick={() => onStop(taskId)}
              title="Stop"
            >
              <Square className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
