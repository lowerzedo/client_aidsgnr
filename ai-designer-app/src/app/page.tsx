import Image from "next/image";
import PhotoUpload from "@/components/PhotoUpload";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <PhotoUpload />
    </main>
  );
}
