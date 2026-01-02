import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

// ✅ Tambah juri baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, password, status } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from("judges").insert([
      {
        name,
        username,
        password: hashedPassword,
        status: status || "active",
      },
    ]);

    if (error) {
      console.error("❌ Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "✅ Juri berhasil ditambahkan",
      data,
    });
  } catch (err: any) {
    console.error("❌ API Crash:", err.message);
    return NextResponse.json(
      { error: "Terjadi kesalahan di server" },
      { status: 500 }
    );
  }
}
