import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ui-shell">
      <Sidebar />
      <Topbar />
      <main className="ml-60 mt-16 min-h-[calc(100vh-4rem)] px-6 py-8 lg:px-8">{children}</main>
    </div>
  );
}
