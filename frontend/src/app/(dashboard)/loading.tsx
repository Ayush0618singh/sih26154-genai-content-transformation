import {
  Skeleton,
} from "@/components/ui/skeleton";


export default function DashboardLoading() {
  return (
    <div className="space-y-6 lg:space-y-7">
      <div
        className={[
          "rounded-[1.75rem]",

          "border",
          "border-border/60",

          "bg-card/60",

          "p-6",

          "sm:p-7",
        ].join(" ")}
      >
        <Skeleton className="h-6 w-40 rounded-full" />

        <Skeleton className="mt-4 h-10 w-72 max-w-full rounded-xl" />

        <Skeleton className="mt-3 h-4 w-[520px] max-w-full" />

        <div className="mt-6 flex gap-3">
          <Skeleton className="h-11 w-36 rounded-xl" />

          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>
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
              className="h-44 rounded-2xl"
            />
          )
        )}
      </div>


      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[390px] rounded-2xl xl:col-span-2" />

        <Skeleton className="h-[390px] rounded-2xl" />
      </div>


      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-[340px] rounded-2xl" />

        <Skeleton className="h-[340px] rounded-2xl" />
      </div>


      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-[330px] rounded-2xl" />

        <Skeleton className="h-[330px] rounded-2xl" />
      </div>
    </div>
  );
}