import Button from "@/components/ui/Button";
import { db } from "../lib/db";

export default async function Home() {
  interface UserMock {
    name: string;
  }

  return (
    <div>
      <Button size={"default"} variant={"default"}>
        Hello Jee
      </Button>
    </div>
  );
}
