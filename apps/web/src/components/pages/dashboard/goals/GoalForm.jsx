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

export default function GoalForm({ register, setValue, watch, priority }) {
  return (
    <div className="space-y-4">
      <Input
        label="Goal title"
        {...register("title", { required: true })}
        placeholder="e.g. Launch v2.0 Platform"
      />
      <Textarea
        label="Description"
        {...register("description")}
        placeholder="What does success look like?"
        rows={3}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select value={priority} onValueChange={(v) => setValue("priority", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
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
    </div>
  );
}
