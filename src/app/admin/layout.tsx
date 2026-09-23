
export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        <div className="min-h-[100dvh] bg-[#080808] text-[#dfdbc9]">
            <main className="container mx-auto py-8">
                {children}
            </main>
        </div>
    )
  }
