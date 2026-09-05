import { Placeholder } from "@/components/routes/placeholder";
import type { RouteProps } from "@/components/routes/types";

export function RouteStyleguide({ resolved }: RouteProps) {
  return <Placeholder kind="styleguide" title={`Styleguide (${resolved.lang})`} />;
}
