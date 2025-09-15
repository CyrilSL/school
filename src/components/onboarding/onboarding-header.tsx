interface OnboardingHeaderProps {
  title: string;
  subtitle?: string;
  bgColorClass?: string;
}

export default function OnboardingHeader({
  title,
  subtitle,
  bgColorClass = "bg-gradient-to-r from-blue-600 to-indigo-700"
}: OnboardingHeaderProps) {
  return (
    <div className={`${bgColorClass} text-white p-4`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-1">{title}</h1>
            {subtitle && <p className="text-blue-100">{subtitle}</p>}
          </div>
        </div>
        <div>
          <a
            href="/parent/dashboard"
            className="inline-flex items-center px-4 py-2 border border-blue-400 rounded-md text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}