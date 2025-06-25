'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { Loader } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)]" 
        style={{backgroundImage: "url('https://placehold.co/1920x1080.png')", opacity: 0.1}}
        data-ai-hint="fantasy anime castle"
      ></div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center p-4">
        <div className="mb-8 flex items-center gap-4 text-primary">
          <Dices className="h-16 w-16" />
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-foreground mb-4">
          Natsuki Quest
        </h1>
        <p className="font-headline text-2xl md:text-3xl font-medium text-primary mb-2">
          A Re:Zero Adventure
        </p>
        <p className="max-w-2xl text-muted-foreground mb-10">
          Your choices shape the story. Your failures are not the end. Can you guide Subaru to a new fate? Powered by AI, every journey is unique.
        </p>

        {status === 'loading' && (
            <Button size="lg" disabled>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Please wait
            </Button>
        )}

        {status === 'unauthenticated' && (
            <Button onClick={() => signIn('discord')} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Login with Discord to Begin
            </Button>
        )}

        {status === 'authenticated' && (
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/game">
                    Begin Your Journey
                </Link>
            </Button>
        )}
      </div>
    </div>
  );
}
