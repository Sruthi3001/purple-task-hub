import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, Circle, LogOut, Plus, Trash2, Calendar as CalendarIcon, BookOpen, ListTodo } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { Timetable } from "@/components/Timetable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TaskTimer } from "@/components/TaskTimer";
import { TimeStats } from "@/components/TimeStats";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  due_date: string | null;
  elapsed_time: number;
  timer_status: "stopped" | "running" | "paused";
  timer_started_at: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;
    
    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });
    setTodos((data || []).map(item => ({
      ...item,
      elapsed_time: item.elapsed_time || 0,
      timer_status: (item.timer_status as "stopped" | "running" | "paused") || "stopped"
    })));
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      await fetchTodos();
      setLoading(false);
    };
    checkUser();
  }, [fetchTodos, navigate]);

  const addTodo = async () => {
    if (!newTodo.trim() || !user) return;

    const { error } = await supabase
      .from("todos")
      .insert([{ 
        title: newTodo, 
        user_id: user.id,
        due_date: dueDate?.toISOString() || null
      }]);

    if (error) {
      toast.error("Error adding task");
      return;
    }

    setNewTodo("");
    setDueDate(undefined);
    fetchTodos();
    toast.success("Task added!");
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await supabase
      .from("todos")
      .update({ completed: !completed })
      .eq("id", id);
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("todos").delete().eq("id", id);
    fetchTodos();
    toast.success("Task deleted");
  };

  const startTimer = async (id: string) => {
    await supabase
      .from("todos")
      .update({ 
        timer_status: "running",
        timer_started_at: new Date().toISOString()
      })
      .eq("id", id);
    fetchTodos();
  };

  const pauseTimer = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo || !todo.timer_started_at) return;

    const startTime = new Date(todo.timer_started_at).getTime();
    const additionalTime = Math.floor((Date.now() - startTime) / 1000);
    const newElapsedTime = todo.elapsed_time + additionalTime;

    await supabase
      .from("todos")
      .update({ 
        timer_status: "paused",
        elapsed_time: newElapsedTime,
        timer_started_at: null
      })
      .eq("id", id);
    fetchTodos();
  };

  const stopTimer = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    let finalElapsedTime = todo.elapsed_time;
    if (todo.timer_status === "running" && todo.timer_started_at) {
      const startTime = new Date(todo.timer_started_at).getTime();
      const additionalTime = Math.floor((Date.now() - startTime) / 1000);
      finalElapsedTime += additionalTime;
    }

    await supabase
      .from("todos")
      .update({ 
        timer_status: "stopped",
        elapsed_time: finalElapsedTime,
        timer_started_at: null
      })
      .eq("id", id);
    fetchTodos();
    toast.success("Timer stopped");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const getDueDateBadge = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const isOverdue = isPast(date) && !isToday(date);
    
    let badgeText = format(date, "MMM d");
    let badgeColor = "bg-muted text-muted-foreground";
    
    if (isOverdue) {
      badgeText = "Overdue";
      badgeColor = "bg-destructive/10 text-destructive border-destructive/20";
    } else if (isToday(date)) {
      badgeText = "Today";
      badgeColor = "bg-accent/20 text-accent-foreground border-accent/30";
    } else if (isTomorrow(date)) {
      badgeText = "Tomorrow";
      badgeColor = "bg-primary/10 text-primary border-primary/20";
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border ${badgeColor}`}>
        <CalendarIcon className="w-3 h-3" />
        {badgeText}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="p-6 bg-gradient-to-r from-primary/15 via-secondary/15 to-accent/15 border-border/50 backdrop-blur-sm shadow-pastel">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-pastel bg-clip-text text-transparent">
                Study Planner
              </h1>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hover:bg-destructive hover:text-destructive-foreground transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="timetable" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Timetable
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-pastel transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-pastel bg-clip-text text-transparent">
                    {todos.length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Total Tasks</div>
                  <div className="mt-3 h-2 bg-gradient-pastel rounded-full animate-pulse"></div>
                </div>
              </Card>
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-pastel transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {todos.filter(t => t.completed).length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Completed</div>
                  <div className="mt-3 h-2 bg-primary rounded-full" style={{width: `${(todos.filter(t => t.completed).length / (todos.length || 1)) * 100}%`}}></div>
                </div>
              </Card>
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-pastel transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent">
                    {todos.filter(t => !t.completed).length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Remaining</div>
                  <div className="mt-3 h-2 bg-accent rounded-full" style={{width: `${(todos.filter(t => !t.completed).length / (todos.length || 1)) * 100}%`}}></div>
                </div>
              </Card>
            </div>

            {/* Time Statistics */}
            <TimeStats todos={todos} />

            {/* Add Todo Form */}
            <Card className="p-6 bg-gradient-to-br from-card via-secondary/10 to-accent/5 border-border/50 shadow-soft">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-pastel bg-clip-text text-transparent">
                Add New Task
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="What needs to be done?"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  className="flex-1 bg-background/50 border-border/50 focus:border-primary transition-all"
                />
                <DatePicker
                  date={dueDate}
                  onDateChange={setDueDate}
                />
                <Button 
                  onClick={addTodo}
                  className="bg-gradient-pastel hover:opacity-90 transition-all shadow-pastel hover:shadow-lg hover:scale-105 duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </Card>

            {/* Todo List */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-soft">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Your Tasks</h2>
              {todos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Circle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No tasks yet. Add one to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="group flex items-center gap-4 p-4 bg-gradient-to-r from-background/50 to-secondary/10 rounded-lg border border-border/50 hover:border-primary/50 hover:shadow-pastel transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-base ${
                          todo.completed 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground font-medium'
                        }`}>
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {todo.due_date && getDueDateBadge(todo.due_date)}
                          <TaskTimer
                            taskId={todo.id}
                            timerStatus={todo.timer_status}
                            elapsedTime={todo.elapsed_time}
                            timerStartedAt={todo.timer_started_at}
                            onStart={startTimer}
                            onPause={pauseTimer}
                            onStop={stopTimer}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="timetable">
            <Timetable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
