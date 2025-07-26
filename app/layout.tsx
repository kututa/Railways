import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Kututa Railway - Book Your Journey",
  description: "Modern railway booking system for Kenya",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
