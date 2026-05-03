"use client";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/common/toggle";
import { Section, SettingRow } from "./ProfileShared";

const EMAIL_NOTIFS = [
  { key: "emailMentions", label: "@Mentions", description: "When someone mentions you in a comment or announcement" },
  { key: "emailTasks", label: "Task assignments", description: "When a task is assigned to you or updated" },
  { key: "emailGoals", label: "Goal updates", description: "Progress changes on goals you own or follow" },
  { key: "emailWeekly", label: "Weekly digest", description: "A summary of your workspace activity every Monday" },
];

const PUSH_NOTIFS = [
  { key: "pushMentions", label: "Mentions & replies", description: "Instant push when you are @mentioned" },
  { key: "pushTasks", label: "Task due dates", description: "24h reminder before a task is due" },
  { key: "pushAnnouncements", label: "New announcements", description: "When a team announcement is posted" },
  { key: "desktopSound", label: "Notification sound", description: "Play a sound for desktop notifications" },
];

export default function NotificationsTab({ notifSettings, toggleNotif }) {
  return (
    <div className="space-y-5">
      <Card>
        <Section title="Email Notifications" description="Choose which emails you'd like to receive." />
        <div className="mt-5 space-y-0">
          {EMAIL_NOTIFS.map((n) => (
            <SettingRow key={n.key} label={n.label} description={n.description}>
              <Toggle checked={notifSettings[n.key]} onChange={() => toggleNotif(n.key)} />
            </SettingRow>
          ))}
        </div>
      </Card>

      <Card>
        <Section title="Push Notifications" description="In-app and browser push notifications." />
        <div className="mt-5 space-y-0">
          {PUSH_NOTIFS.map((n) => (
            <SettingRow key={n.key} label={n.label} description={n.description}>
              <Toggle checked={notifSettings[n.key]} onChange={() => toggleNotif(n.key)} />
            </SettingRow>
          ))}
        </div>
      </Card>

      <Card>
        <Section title="Notification Schedule" description="Pause notifications during off-hours." />
        <div className="mt-5 space-y-0">
          <SettingRow label="Focus mode" description="Silence all notifications and show DND status">
            <Toggle checked={false} onChange={() => {}} />
          </SettingRow>
          <SettingRow label="Working hours" description="Only receive notifications Mon–Fri, 9am–6pm">
            <Toggle checked={true} onChange={() => {}} />
          </SettingRow>
        </div>
      </Card>
    </div>
  );
}
