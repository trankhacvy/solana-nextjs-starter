import Footer from "@/components/footer"
import Header from "@/components/header"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container mx-auto min-h-screen px-4 py-24 md:px-6">{children}</main>
      <Footer />
    </>
  )
}
