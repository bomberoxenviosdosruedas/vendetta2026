
export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        <div className="min-h-screen bg-muted/20">
            <main className="container mx-auto py-8">
                {children}
            </main>
        </div>
    )
  }
