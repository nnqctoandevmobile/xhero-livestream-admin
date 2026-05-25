export default function ConfigTab({
  title = '',
  description = '',
  children
}) {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-[#7E8CA8] mb-6">
          {description}
        </p>
        {children}
      </div>
    </div>
  );
}