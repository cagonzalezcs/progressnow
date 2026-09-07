/* a11y-patched (scripts/a11y-patch-examples.mjs): aria-label added to 7 labelled controls.
 * Upstream shadcn registry example otherwise unchanged; re-run the script after a re-sync. */
import { Example, ExampleWrapper } from "@/components/styleguide/examples/example";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SwitchExample() {
  return (
    <ExampleWrapper data-testid="switch-example">
      <SwitchBasic />
      <SwitchWithDescription />
      <SwitchWithLabel />
      <SwitchDisabled />
      <SwitchSizes />
    </ExampleWrapper>
  );
}

function SwitchBasic() {
  return (
    <Example title="Basic">
      <Field orientation="horizontal">
        <Switch aria-label="Airplane Mode" id="switch-basic" />
        <FieldLabel htmlFor="switch-basic">Airplane Mode</FieldLabel>
      </Field>
    </Example>
  );
}

function SwitchWithLabel() {
  return (
    <Example title="With Label">
      <div className="flex items-center gap-2">
        <Switch aria-label="Bluetooth" id="switch-bluetooth" defaultChecked />
        <Label htmlFor="switch-bluetooth">Bluetooth</Label>
      </div>
    </Example>
  );
}

function SwitchWithDescription() {
  return (
    <Example title="With Description">
      <FieldLabel htmlFor="switch-focus-mode">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Share across devices</FieldTitle>
            <FieldDescription>
              Focus is shared across devices, and turns off when you leave the app.
            </FieldDescription>
          </FieldContent>
          <Switch
            aria-label="Share across devices Focus is shared across devices, and turns off when you leave the app."
            id="switch-focus-mode"
          />
        </Field>
      </FieldLabel>
    </Example>
  );
}

function SwitchDisabled() {
  return (
    <Example title="Disabled">
      <div className="flex flex-col gap-12">
        <div className="flex items-center gap-2">
          <Switch aria-label="Disabled (Unchecked)" id="switch-disabled-unchecked" disabled />
          <Label htmlFor="switch-disabled-unchecked">Disabled (Unchecked)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            aria-label="Disabled (Checked)"
            id="switch-disabled-checked"
            defaultChecked
            disabled
          />
          <Label htmlFor="switch-disabled-checked">Disabled (Checked)</Label>
        </div>
      </div>
    </Example>
  );
}

function SwitchSizes() {
  return (
    <Example title="Sizes">
      <div className="flex flex-col gap-12">
        <div className="flex items-center gap-2">
          <Switch aria-label="Small" id="switch-size-sm" size="sm" />
          <Label htmlFor="switch-size-sm">Small</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch aria-label="Default" id="switch-size-default" size="default" />
          <Label htmlFor="switch-size-default">Default</Label>
        </div>
      </div>
    </Example>
  );
}
