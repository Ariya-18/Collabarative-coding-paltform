const colorMap = {
  primary: "text-[#6366F1] bg-[#6366F1]/10",
  secondary: "text-[#8B5CF6] bg-[#8B5CF6]/10",
  accent: "text-[#06B6D4] bg-[#06B6D4]/10",
  success: "text-[#22C55E] bg-[#22C55E]/10",
};

const StatsCard = ({ icon: Icon, label, value, color = "primary" }) => {
  return (
    <div className="bg-[#111827] border border-white/5 rounded-xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[#9CA3AF] text-xs">{label}</p>
        <p className="text-white text-xl font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;