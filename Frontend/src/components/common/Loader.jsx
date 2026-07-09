import { Loader2 } from "lucide-react";

const Loader = ({ size = 24, fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F19]">
        <Loader2 className="animate-spin text-[#6366F1]" size={size} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="animate-spin text-[#6366F1]" size={size} />
    </div>
  );
};

export default Loader;