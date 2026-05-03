"use client";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartTooltip } from "./DashboardComponents";

export default function TasksTab({ tasks }) {
  const totalTasks = Object.values(tasks).flat().length;
  const cols = [
    { label: "To Do", count: tasks.todo?.length || 0, color: "var(--text-muted)", bg: "var(--surface-2)" },
    { label: "In Progress", count: tasks.inProgress?.length || 0, color: "var(--warning)", bg: "var(--warning-soft)" },
    { label: "In Review", count: tasks.review?.length || 0, color: "var(--info)", bg: "var(--info-soft)" },
    { label: "Done", count: tasks.done?.length || 0, color: "var(--success)", bg: "var(--success-soft)" },
  ];
  const allFlat = Object.values(tasks).flat();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-5">Tasks by Column</h3>
          <div className="space-y-4">
            {cols.map((col) => (
              <div key={col.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[var(--text-primary)]">{col.label}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{col.count}</span>
                </div>
                <div className="w-full h-2.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${totalTasks ? (col.count / totalTasks) * 100 : 0}%`,
                      backgroundColor: col.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-5">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { name: "High", count: allFlat.filter((t) => t.priority === "high").length },
                { name: "Medium", count: allFlat.filter((t) => t.priority === "medium").length },
                { name: "Low", count: allFlat.filter((t) => t.priority === "low").length },
              ]}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
              barSize={14}
            >
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Tasks" radius={[0, 4, 4, 0]}>
                {["#dc2626", "#d97706", "#0891b2"].map((c, i) => <Cell key={i} fill={c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
