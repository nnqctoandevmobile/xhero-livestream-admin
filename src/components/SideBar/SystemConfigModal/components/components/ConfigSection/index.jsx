export default function ConfigSection({
  title = '',
  buttonTitle,
  children,
}) {
  return (
    <div className="border border-[#1E2633] rounded-xl bg-[#151D2C] overflow-hidden mb-6">
      <div className="flex justify-between items-center p-4 border-b border-[#1E2633]">
        <h3 className="font-bold text-white text-sm">{title}</h3>
        {buttonTitle && <button className="px-3 py-1.5 bg-[#1E2633] hover:bg-[#2A3441] text-white text-xs font-bold rounded-lg transition-colors border border-[#2A3441]">{buttonTitle}</button>}
      </div>
      <div className="p-4 space-y-5">
        {children}
      </div>
    </div>
  );
}