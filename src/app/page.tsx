"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  return <Button onClick={() => toast.success("Hello world")}>click me</Button>;
}
