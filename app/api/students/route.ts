import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchStudents } from "@/lib/students";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const students = await fetchStudents(session.accessToken);
    return NextResponse.json(students);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch students";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
