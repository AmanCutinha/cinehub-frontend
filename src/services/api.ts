export const API_BASE_URL = "http://localhost:8081";

export async function testBackendConnection(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    if (!response.ok) throw new Error("Backend not responding");
    return await response.text();
  } catch (error) {
    console.error("Error connecting to backend:", error);
    return "⚠️ Failed to connect to backend";
  }
}
