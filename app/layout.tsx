import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Jura, Orbitron } from 'next/font/google';
import './globals.css';
import Shell from '@/src/components/Shell';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const jura = Jura({ subsets: ['latin'], variable: '--font-heading' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'AgentDashboard',
  description: 'Control plane for multi-agent operations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jura.variable} ${jetbrainsMono.variable} ${orbitron.variable}`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
