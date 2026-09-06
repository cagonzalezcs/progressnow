"use client";

import { toast } from "sonner";

import { Example, ExampleWrapper } from "@/components/styleguide/examples/example";
import { Button } from "@/components/ui/button";

export default function SonnerExample() {
  return (
    <ExampleWrapper data-testid="sonner-example">
      <SonnerBasic />
      <SonnerWithDescription />
    </ExampleWrapper>
  );
}

function SonnerBasic() {
  return (
    <Example title="Basic" className="items-center justify-center">
      <Button onClick={() => toast("Event has been created")} variant="outline" className="w-fit">
        Show Toast
      </Button>
    </Example>
  );
}

function SonnerWithDescription() {
  return (
    <Example title="With Description" className="items-center justify-center">
      <Button
        onClick={() =>
          toast("Event has been created", {
            description: "Monday, January 3rd at 6:00pm",
          })
        }
        variant="outline"
        className="w-fit"
      >
        Show Toast
      </Button>
    </Example>
  );
}
