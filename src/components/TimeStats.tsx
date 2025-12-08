import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Todo {
  id: string;
  title: string;
  elapsed_time: number;
}

interface TimeStatsProps {
  todos: Todo[];
}

const COLORS = [
  "hsl(280, 70%, 60%)",
  "hsl(260, 70%, 65%)",
  "hsl(300, 70%, 55%)",
  "hsl(320, 70%, 60%)",
  "hsl(240, 70%, 65%)",
  "hsl(290, 60%, 70%)",
  "hsl(270, 65%, 55%)",
  "hsl(310, 65%, 65%)",
];

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const TimeStats = ({ todos }: TimeStatsProps) => {
  const totalTime = todos.reduce((acc, todo) => acc + (todo.elapsed_time || 0), 0);
  
  const tasksWithTime = todos.filter(todo => todo.elapsed_time > 0);
  
  const chartData = tasksWithTime.map(todo => ({
    name: todo.title.length > 20 ? todo.title.substring(0, 20) + "..." : todo.title,
    value: todo.elapsed_time,
    fullName: todo.title,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Total Time Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10 border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/20 rounded-full">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Time Spent</p>
            <p className="text-3xl font-bold bg-gradient-pastel bg-clip-text text-transparent">
              {formatTime(totalTime)}
            </p>
          </div>
        </div>
      </Card>

      {/* Time Breakdown Chart */}
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Time per Task</h3>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No time tracked yet</p>
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatTime(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};
