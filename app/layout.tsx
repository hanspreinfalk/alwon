import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Alwon',
  description: 'Retail Automation OS — Operator Console',
}

/** Runs before paint — avoids FOUC; ThemeProvider syncs on the client without injecting `<script>` in React (React 19). */
const themeBootScript = `(function(){try{var d=document.documentElement;var k='theme';var s=localStorage.getItem(k)||'dark';var r;if(s==='system'){r=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}else{r=s==='dark'?'dark':'light';}d.classList.toggle('dark',r==='dark');}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        {/* Runs before paint on every navigation — avoids FOUC without putting a <script> in the client React tree (React 19). */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body suppressHydrationWarning className="h-full antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TooltipProvider delayDuration={200}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
