import CardSkeleton from "~/components/Cards/CardSkeleton";

export default function Loading() {
    const skeletonCount = 5;

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                {/* Render 5 CardSkeleton components */}
                {Array.from({ length: skeletonCount }, (_, index) => (
                    <CardSkeleton key={index} />
                ))}
            </div>
        </>
    );
}