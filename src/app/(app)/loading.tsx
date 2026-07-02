import { Spinner } from "@/components/ui/spinner";

// Route-level fallback for navigations inside the app shell
// (account, admin — catalog has its own richer skeleton).
export default function AppLoading() {
  return (
    <div className="grid min-h-[50dvh] place-items-center">
      <Spinner className="size-8 text-accent" />
    </div>
  );
}
