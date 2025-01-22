import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusSquare, Trash2, Edit2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  reminder_date?: string | null;
  user_id: string;
}

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [reminderDate, setReminderDate] = useState<Date>();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      console.log("Fetching todos for user:", user?.id);
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Fetched todos:", data);
      setTodos(data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast({
        title: "Error",
        description: "Failed to fetch todos",
        variant: "destructive",
      });
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      console.log("Adding new todo:", { title: newTodo, reminder_date: reminderDate });
      const { error } = await supabase.from("todos").insert([
        {
          title: newTodo,
          user_id: user?.id,
          reminder_date: reminderDate?.toISOString(),
        },
      ]);

      if (error) throw error;

      setNewTodo("");
      setReminderDate(undefined);
      fetchTodos();
      toast({
        title: "Success",
        description: "Todo added successfully",
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: "Failed to add todo",
        variant: "destructive",
      });
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      console.log("Toggling todo completion:", { id, completed: !completed });
      const { error } = await supabase
        .from("todos")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;
      fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  const updateTodo = async (id: string, title: string, reminder_date?: Date) => {
    try {
      console.log("Updating todo:", { id, title, reminder_date });
      const { error } = await supabase
        .from("todos")
        .update({ 
          title,
          reminder_date: reminder_date?.toISOString() 
        })
        .eq("id", id);

      if (error) throw error;
      setEditingTodo(null);
      fetchTodos();
      toast({
        title: "Success",
        description: "Todo updated successfully",
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      console.log("Deleting todo:", id);
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) throw error;
      fetchTodos();
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {reminderDate ? format(reminderDate, "PPP") : "Set reminder"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={reminderDate}
                onSelect={setReminderDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button type="submit">
            <PlusSquare className="mr-2" />
            Add
          </Button>
        </form>
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-center justify-between p-4 border rounded",
                todo.completed ? "bg-muted" : ""
              )}
            >
              {editingTodo?.id === todo.id ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editingTodo.title}
                    onChange={(e) =>
                      setEditingTodo({ ...editingTodo, title: e.target.value })
                    }
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingTodo.reminder_date
                          ? format(new Date(editingTodo.reminder_date), "PPP")
                          : "Set reminder"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          editingTodo.reminder_date
                            ? new Date(editingTodo.reminder_date)
                            : undefined
                        }
                        onSelect={(date) =>
                          setEditingTodo({
                            ...editingTodo,
                            reminder_date: date?.toISOString(),
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    onClick={() =>
                      updateTodo(
                        todo.id,
                        editingTodo.title,
                        editingTodo.reminder_date
                          ? new Date(editingTodo.reminder_date)
                          : undefined
                      )
                    }
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingTodo(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                    />
                    <span
                      className={cn(
                        "flex flex-col",
                        todo.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {todo.title}
                      {todo.reminder_date && (
                        <span className="text-sm text-muted-foreground">
                          Reminder: {format(new Date(todo.reminder_date), "PPP")}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTodo(todo)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Todos;