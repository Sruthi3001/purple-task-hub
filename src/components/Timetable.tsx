import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  topic: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const Timetable = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    day: DAYS[0],
    time: "",
    subject: "",
    topic: ""
  });

  const addEntry = () => {
    if (!newEntry.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!newEntry.time.trim()) {
      toast.error("Please enter a time");
      return;
    }

    const entry: TimetableEntry = {
      id: Date.now().toString(),
      ...newEntry
    };

    setEntries([...entries, entry]);
    setNewEntry({ day: DAYS[0], time: "", subject: "", topic: "" });
    toast.success("Entry added to timetable");
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    toast.success("Entry removed");
  };

  const getEntriesForDay = (day: string) => {
    return entries.filter(e => e.day === day).sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6 bg-gradient-to-br from-background via-card to-secondary/20 border-border/50 shadow-pastel">
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-pastel bg-clip-text text-transparent">
          Add Study Session
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={newEntry.day}
            onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
            className="px-3 py-2 rounded-lg bg-background border border-border text-foreground"
          >
            {DAYS.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <Input
            type="time"
            placeholder="Time"
            value={newEntry.time}
            onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
            className="bg-background"
          />
          <Input
            placeholder="Subject"
            value={newEntry.subject}
            onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
          />
          <Input
            placeholder="Topic (optional)"
            value={newEntry.topic}
            onChange={(e) => setNewEntry({ ...newEntry, topic: e.target.value })}
          />
        </div>
        <Button onClick={addEntry} className="mt-4 w-full md:w-auto bg-gradient-pastel hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add to Timetable
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS.map(day => {
          const dayEntries = getEntriesForDay(day);
          return (
            <Card key={day} className="p-4 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-pastel transition-all">
              <h3 className="font-semibold text-lg mb-3 text-center bg-gradient-pastel bg-clip-text text-transparent border-b border-border/50 pb-2">
                {day}
              </h3>
              {dayEntries.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No sessions</p>
              ) : (
                <div className="space-y-2">
                  {dayEntries.map(entry => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 group relative"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        {entry.time}
                      </div>
                      <div className="font-semibold text-sm text-foreground">{entry.subject}</div>
                      {entry.topic && (
                        <div className="text-xs text-muted-foreground mt-1">{entry.topic}</div>
                      )}
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
