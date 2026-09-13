import {
  Skeleton,
} from "@/components/ui/skeleton";


export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />

        <Skeleton className="h-10 w-72 max-w-full" />

        <Skeleton className="h-4 w-[420px] max-w-full" />
      </div>


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map(
          (
            _,
            index
          ) => (
            <Skeleton
              key={
                index
              }
              className="h-36 rounded-xl"
            />
          )
        )}
      </div>


      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />

        <Skeleton className="h-80 rounded-xl" />
      </div>


      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}