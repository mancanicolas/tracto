import { UserAttentionType, getCurrentWindow } from "@tauri-apps/api/window";

export async function attractWindowAttention(): Promise<void> {
  try {
    const appWindow = getCurrentWindow();
    await appWindow.unminimize();
    await appWindow.requestUserAttention(UserAttentionType.Critical);
  } catch {
    return;
  }
}
