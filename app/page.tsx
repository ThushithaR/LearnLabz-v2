import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[url('/grid-pattern.svg')] bg-cover relative">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-accent/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-highlight/20 blur-[120px]" />

            <div className="z-10 text-center max-w-4xl px-4">
                <h1 className="mb-2 text-7xl font-bold tracking-tighter text-white sm:text-8xl md:text-9xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                    LearnLabz
                </h1>

                <h2 className="mb-8 text-3xl font-light tracking-tight text-textSecondary sm:text-4xl">
                    Master AI. <span className="text-accent font-normal">Level Up Your Future.</span>
                </h2>

                <p className="mb-12 text-xl text-textSecondary/80 sm:text-2xl max-w-2xl mx-auto leading-relaxed">
                    The premium, gamified learning platform for serious scholars.
                    <br />Stop watching videos. Start solving problems.
                </p>

                <div className="flex flex-col items-center gap-6">
                    <Link href="/signup">
                        <Button size="lg" className="h-14 px-12 text-lg rounded-full shadow-[0_0_50px_-10px_rgba(198,172,143,0.4)] hover:shadow-[0_0_60px_-10px_rgba(198,172,143,0.6)] transition-all duration-300 border border-accent/20">
                            Get Started
                        </Button>
                    </Link>

                    <div className="flex items-center gap-2 text-sm text-textSecondary">
                        <span>Already have an account?</span>
                        <Link href="/login" className="font-medium text-accent hover:text-white transition-colors underline-offset-4 hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Floating UI Elements for decoration */}
            <div className="absolute top-1/4 left-10 hidden lg:block animate-float" style={{ animationDelay: '0s' }}>
                <div className="glass-panel p-4 rounded-lg border border-accent/20">
                    <code className="text-accent text-sm">def minimax(node, depth):</code>
                </div>
            </div>
            <div className="absolute bottom-1/4 right-10 hidden lg:block animate-float" style={{ animationDelay: '2s' }}>
                <div className="glass-panel p-4 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        <span className="text-sm font-medium">Test Cases Passed</span>
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-8 text-center text-sm text-textSecondary/50">
                © 2025 LearnLabz
            </footer>
        </main>
    );
}
