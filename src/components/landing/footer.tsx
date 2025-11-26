export function Footer() {
  return (
    <footer className="border-t border-border py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-6">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; 2025 Ryzan Payments. Built for the Avalanche Hackathon.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </footer>
  );
}