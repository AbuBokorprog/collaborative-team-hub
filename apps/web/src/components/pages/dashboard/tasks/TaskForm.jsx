"use client";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/common/textArea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const PRIORITY_OPTS = [
  { value: "high", label: "🔴 High" },
  { value: "medium", label: "🟡 Medium" },
  { value: "low", label: "🔵 Low" },
];

export default function TaskForm({ register: reg, setValue, watch, goals, users, priority, goalId, assigneeId }) {
  return (
    <div className="space-y-4">
      <Input label="Task title" {...reg("title", { required: true })} placeholder="What needs to be done?" />
      <Textarea label="Description" {...reg("desc")} placeholder="Add more context..." rows={3} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select value={priority} onValueChange={(v) => setValue("priority", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTS.map((item) => (
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Goal (optional)</label>
          <Select value={goalId || "none"} onValueChange={(v) => setValue("goalId", v === "none" ? "" : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No goal</SelectItem>
              {goals.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Assign to</label>
        <Select
          value={assigneeId || "unassigned"}
          onValueChange={(v) => setValue("assigneeId", v === "unassigned" ? "" : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Due date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watch("dueDate") ? format(new Date(watch("dueDate")), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={watch("dueDate") ? new Date(watch("dueDate")) : undefined}
              onSelect={(date) => setValue("dueDate", date ? format(date, "yyyy-MM-dd") : "")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
