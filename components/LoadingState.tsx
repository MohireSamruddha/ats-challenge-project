import { Loader2 } from "lucide-react";

export function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
} 