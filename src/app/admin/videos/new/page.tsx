import Link from "next/link";
import { getUser, getUserRole } from "@/lib/appwrite/server";
import { Header } from "@/components/header";
import { VideoForm } from "@/components/video-form";

export const dynamic = "force-dynamic";

export default async function NewVideoPage() {
  const user = await getUser();
  const role = await getUserRole(user!.$id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header email={user!.email} role={role} />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin/videos" className="text-sm text-blue-600 hover:underline">
          ← 動画管理に戻る
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-6">動画を追加</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <VideoForm />
        </div>
      </main>
    </div>
  );
}
