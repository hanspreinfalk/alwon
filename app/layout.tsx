import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        {/* beforeInteractive runs before hydration, outside React's reconciler — avoids FOUC and the React 19 script-in-component warning */}
        <Script id="theme-boot" strategy="beforeInteractive">{`(function(){try{var d=document.documentElement;var s=localStorage.getItem('theme')||'dark';var r;if(s==='system'){r=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}else{r=s==='dark'?'dark':'light';}d.classList.toggle('dark',r==='dark');}catch(e){}})();`}</Script>
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
