import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, LogOut, Plus, Trash2 } from "lucide-react";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;

    try {
      const { error } = await supabase
        .from("todos")
        .insert([{ title: newTodo, user_id: user.id }]);

      if (error) throw error;

      setNewTodo("");
      fetchTodos();
      toast({
        title: "Todo added!",
        description: "Your task has been created.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;
      fetchTodos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) throw error;
      fetchTodos();
      toast({
        title: "Todo deleted",
        description: "Your task has been removed.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-purple-soft">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-purple rounded-2xl shadow-purple animate-pulse">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-purple-soft p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-purple rounded-xl shadow-purple">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-purple bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
            className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-1 bg-card shadow-soft border-border/50"
            />
            <Button
              type="submit"
              className="bg-gradient-purple hover:opacity-90 transition-opacity shadow-purple"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </form>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-4">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No todos yet. Add one to get started!</p>
            </div>
          ) : (
            todos.map((todo, index) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-soft border border-border/50 hover:shadow-purple transition-all group animate-slide-in"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span
                  className={`flex-1 transition-all ${
                    todo.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {todo.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-6 p-4 bg-card rounded-xl shadow-soft border border-border/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {todos.filter((t) => !t.completed).length} active
              </span>
              <span className="text-muted-foreground">
                {todos.filter((t) => t.completed).length} completed
              </span>
              <span className="text-muted-foreground">
                {todos.length} total
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
