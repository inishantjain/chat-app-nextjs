import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function chatHrefConstructor(id1: string, id2: string) {
  return id1 < id2 ? `${id1}--${id2}` : `${id2}--${id1}`;
}

export function toPusherKey(key: string) {
  return key.replace(/:/g, "__");
}
