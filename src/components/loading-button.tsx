import { Button, type ButtonProps } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Loader2 } from "lucide-react";
export default function LoadingButton({
  pending,
  children,
  onClick,
  className = "",
  ...props
}: {
  pending: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
} & ButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn("w-full", className)}
      disabled={pending}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
