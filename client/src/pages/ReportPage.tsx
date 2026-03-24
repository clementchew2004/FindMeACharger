import { ReportForm } from "@/components/report-form";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ReportPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <ReportForm />
      </div>
      <div style={{ position: 'fixed', bottom: '12px', right: '12px' }}>
        <LanguageSwitcher />
      </div>
    </div>
  );
}