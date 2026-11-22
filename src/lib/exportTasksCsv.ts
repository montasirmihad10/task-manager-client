import { axiosInstance } from "@/lib/axios/axiosInstance";
import { envConfig } from "@/config/envConfig";

export async function exportTasksCsv(workspaceId: string) {
  const base = (envConfig.baseApi || "").replace(/\/$/, "");
  const res = await axiosInstance.get(`${base}/tasks/export.csv`, {
    params: { workspaceId },
    responseType: "blob",
    headers: { Accept: "text/csv" },
  });

  const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks-${workspaceId.slice(-6)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
