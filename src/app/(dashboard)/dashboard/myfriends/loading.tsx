import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function loading() {
  return (
    <div className="w-full flex flex-col gap-3">
      <Skeleton className="mb-4" height={60} width={300} />
      <Skeleton height={30} width={450} />
      <Skeleton height={30} width={450} />
      <Skeleton height={30} width={405} />
    </div>
  );
}

export default loading;
