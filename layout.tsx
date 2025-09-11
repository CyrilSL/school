import { Poppins } from 'next/font/google'
import './globals.css'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
// import { ThemeProvider } from 'next-themes'
import ScrollToTop from '@/components/ScrollToTop'
import Aoscompo from '@/utils/aos'
import Script from 'next/script'

const font = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${font.className}`}>
          <Aoscompo>
            <Header />
            {children}
            
            <Footer />
          </Aoscompo>
        {/* <ScrollToTop /> */}
        <Script id="helpkite-settings" strategy="afterInteractive">
          {`
            window.helpkiteSettings = {
              organizationId: 'fy06VMYBQw3PW5BlVsQDaaMxwAJ2Yd86',
              agentId: 'xpwn3onpey8i37vulvw49fw7',
            };
          `}
        </Script>
        <Script
          src="http://localhost:3001/sdk"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}