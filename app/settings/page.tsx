import { SettingsForm } from "@/components/settings-form";
import { getAppSettings } from "@/lib/data";

export default async function SettingsPage() {
  const settings = await getAppSettings();
  return <SettingsForm settings={settings} />;
}
