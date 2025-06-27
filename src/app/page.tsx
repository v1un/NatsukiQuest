'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { Loader } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-rezero-mansion to-background">
      {/* Atmospheric background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1)_0%,transparent_70%)]"></div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center p-4">
        {/* Logo/Icon with enhanced styling */}
        <div className="mb-8 flex items-center gap-4 text-primary drop-shadow-lg">
          <div className="relative">
            <Dices className="h-16 w-16 relative z-10" />
            <div className="absolute inset-0 h-16 w-16 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
        
        {/* Main Title with enhanced typography */}
        <div className="mb-8 space-y-4">
          <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tight text-foreground drop-shadow-sm">
            <span className="bg-gradient-to-r from-primary via-rezero-royal to-primary bg-clip-text text-transparent">
              Natsuki Quest
            </span>
          </h1>
          <p className="font-headline text-2xl md:text-3xl font-semibold text-primary/90 drop-shadow-sm">
            A Re:Zero Adventure
          </p>
        </div>
        
        {/* Description with better typography */}
        <div className="max-w-2xl mb-12 space-y-4">
          <p className="narrative-text text-lg md:text-xl text-foreground/80 leading-relaxed">
            Your choices shape the story. Your failures are not the end. 
            <br />
            <span className="magic-text font-semibold">Can you guide Subaru to a new fate?</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by AI • Every journey is unique • Return by Death awaits
          </p>
        </div>

        {/* Enhanced action buttons */}
        <div className="space-y-4">
          {status === 'loading' && (
            <Button size="lg" disabled className="choice-button px-8 py-4 text-lg">
              <Loader className="mr-3 h-5 w-5 animate-spin" />
              Weaving the threads of fate...
            </Button>
          )}

          {status === 'unauthenticated' && (
            <Button 
              onClick={() => signIn('discord')} 
              size="lg" 
              className="choice-button bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Login with Discord to Begin
            </Button>
          )}

          {status === 'authenticated' && (
            <div className="space-y-3">
              <Button asChild size="lg" className="choice-button bg-gradient-to-r from-primary to-rezero-royal hover:from-primary/90 hover:to-rezero-royal/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl">
                <Link href="/game">
                  Begin Your Journey
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Welcome back, {session?.user?.name}
              </p>
            </div>
          )}
        </div>
        
        {/* Subtle footer hint */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-xs text-muted-foreground/60 italic">
            "I will save everyone. No matter how many times it takes." - Natsuki Subaru
          </p>
        </div>
      </div>
    </div>
  );
}
