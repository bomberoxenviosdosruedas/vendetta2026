
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/img/general/fondo.jpg"
                    alt="Fondo de la ciudad de Vendetta"
                    fill
                    className="object-cover"
                    data-ai-hint="dark rainy city street"
                    priority
                />
                <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-background via-black/50 to-transparent" />
            </div>
            
            <div className="z-10 flex flex-col items-center justify-center space-y-8">
                {children}
            </div>
             <div className="absolute bottom-4 right-4 z-10">
                <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Volver
                </Link>
            </div>
        </main>
    )
  }
