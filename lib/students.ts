import { getSheetsClient } from "./google";
import { Student } from "@/types";

interface CacheEntry {
  data: Student[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cache: CacheEntry | null = null;

export async function fetchStudents(accessToken: string): Promise<Student[]> {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  const sheets = getSheetsClient(accessToken);
  const sheetId = process.env.STUDENT_REGISTER_SHEET_ID!;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1!A:G",
  });

  const rows = response.data.values ?? [];
  const students: Student[] = [];

  for (const row of rows) {
    const fileNo = (row[1] ?? "").toString().trim();
    const surname = (row[4] ?? "").toString().trim();
    if (!fileNo || !surname) continue;
    // Validate file number pattern: 2 letters + 3 digits + 1 letter
    if (!/^[A-Za-z]{2}\d{3}[A-Za-z]$/i.test(fileNo)) continue;

    students.push({
      fileNo,
      surname,
      firstName: (row[5] ?? "").toString().trim(),
      school: (row[3] ?? "").toString().trim(),
      dateRegistered: (row[2] ?? "").toString().trim(),
      staffInitial: (row[6] ?? "").toString().trim(),
    });
  }

  cache = { data: students, timestamp: now };
  return students;
}

export function clearStudentCache() {
  cache = null;
}
