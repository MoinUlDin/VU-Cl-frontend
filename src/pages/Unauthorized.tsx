import { Lock } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="p-8 flex gap-4 items-center justify-center mt-8">
      <div className="flex gap-4 items-center">
        <Lock className="text-gray-400" size={80} />
        <div>
          <h1 className="text-3xl font-bold mb-2">Unauthorized</h1>
          <p className="text-gray-600">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    </div>
  );
}
