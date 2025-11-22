import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  topic: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = [
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
];

export const Timetable = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    day: DAYS[0],
    time: TIME_SLOTS[0],
    subject: "",
    topic: ""
  });

  const addEntry = () => {
    if (!newEntry.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    const entry: TimetableEntry = {
      id: Date.now().toString(),
      ...newEntry
    };

    setEntries([...entries, entry]);
    setNewEntry({ day: DAYS[0], time: TIME_SLOTS[0], subject: "", topic: "" });
    toast.success("Entry added to timetable");
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    toast.success("Entry removed");
  };

  const getEntriesForDayAndTime = (day: string, time: string) => {
    return entries.filter(e => e.day === day && e.time === time);
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
          <select
            value={newEntry.time}
            onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
            className="px-3 py-2 rounded-lg bg-background border border-border text-foreground"
          >
            {TIME_SLOTS.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
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
        <Button onClick={addEntry} className="mt-4 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add to Timetable
        </Button>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-soft">
          <thead>
            <tr className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
              <th className="border border-border p-3 text-left font-semibold">Time</th>
              {DAYS.map(day => (
                <th key={day} className="border border-border p-3 text-center font-semibold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(time => (
              <tr key={time} className="hover:bg-muted/30 transition-colors">
                <td className="border border-border p-3 font-medium text-sm bg-muted/20">
                  {time}
                </td>
                {DAYS.map(day => {
                  const dayEntries = getEntriesForDayAndTime(day, time);
                  return (
                    <td key={`${day}-${time}`} className="border border-border p-2">
                      {dayEntries.map(entry => (
                        <div
                          key={entry.id}
                          className="mb-1 last:mb-0 p-2 rounded bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 group relative"
                        >
                          <div className="font-semibold text-sm text-foreground">{entry.subject}</div>
                          {entry.topic && (
                            <div className="text-xs text-muted-foreground">{entry.topic}</div>
                          )}
                          <button
                            onClick={() => removeEntry(entry.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
