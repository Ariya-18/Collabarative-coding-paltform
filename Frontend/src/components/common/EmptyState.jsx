const EmptyState = ({ icon: Icon, title, subtitle, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-[#111827] border border-white/5 flex items-center justify-center mb-4">
          <Icon size={24} className="text-[#9CA3AF]" />
        </div>
      )}
      <h3 className="text-white font-medium text-sm mb-1">{title}</h3>
      {subtitle && <p className="text-[#9CA3AF] text-xs mb-4 max-w-xs">{subtitle}</p>}
      {action}
    </div>
  );
};

export default EmptyState;