/* a11y-patched (scripts/a11y-patch-examples.mjs): aria-label added to 19 labelled controls.
 * Upstream shadcn registry example otherwise unchanged; re-run the script after a re-sync. */
import { Example, ExampleWrapper } from "@/components/styleguide/examples/example";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RadioGroupExample() {
  return (
    <ExampleWrapper data-testid="radio-group-example">
      <RadioGroupBasic />
      <RadioGroupWithDescriptions />
      <RadioGroupWithFieldSet />
      <RadioGroupGrid />
      <RadioGroupDisabled />
      <RadioGroupInvalid />
    </ExampleWrapper>
  );
}

function RadioGroupBasic() {
  return (
    <Example title="Basic">
      <RadioGroup defaultValue="comfortable">
        <Field orientation="horizontal">
          <RadioGroupItem aria-label="Default" value="default" id="r1" />
          <FieldLabel htmlFor="r1" className="font-normal">
            Default
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem aria-label="Comfortable" value="comfortable" id="r2" />
          <FieldLabel htmlFor="r2" className="font-normal">
            Comfortable
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem aria-label="Compact" value="compact" id="r3" />
          <FieldLabel htmlFor="r3" className="font-normal">
            Compact
          </FieldLabel>
        </Field>
      </RadioGroup>
    </Example>
  );
}

function RadioGroupWithDescriptions() {
  return (
    <Example title="With Descriptions">
      <RadioGroup defaultValue="plus">
        <FieldLabel htmlFor="plus-plan">
          <Field orientation="horizontal">
            <FieldContent>
              <div className="font-medium">Plus</div>
              <FieldDescription>For individuals and small teams</FieldDescription>
            </FieldContent>
            <RadioGroupItem
              aria-label="Plus For individuals and small teams"
              value="plus"
              id="plus-plan"
            />
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="pro-plan">
          <Field orientation="horizontal">
            <FieldContent>
              <div className="font-medium">Pro</div>
              <FieldDescription>For growing businesses</FieldDescription>
            </FieldContent>
            <RadioGroupItem aria-label="Pro For growing businesses" value="pro" id="pro-plan" />
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="enterprise-plan">
          <Field orientation="horizontal">
            <FieldContent>
              <div className="font-medium">Enterprise</div>
              <FieldDescription>For large teams and enterprises</FieldDescription>
            </FieldContent>
            <RadioGroupItem
              aria-label="Enterprise For large teams and enterprises"
              value="enterprise"
              id="enterprise-plan"
            />
          </Field>
        </FieldLabel>
      </RadioGroup>
    </Example>
  );
}

function RadioGroupWithFieldSet() {
  return (
    <Example title="With FieldSet">
      <FieldSet>
        <FieldLegend>Battery Level</FieldLegend>
        <FieldDescription>Choose your preferred battery level.</FieldDescription>
        <RadioGroup defaultValue="medium">
          <Field orientation="horizontal">
            <RadioGroupItem aria-label="High" value="high" id="battery-high" />
            <FieldLabel htmlFor="battery-high" className="font-normal">
              High
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem aria-label="Medium" value="medium" id="battery-medium" />
            <FieldLabel htmlFor="battery-medium" className="font-normal">
              Medium
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem aria-label="Low" value="low" id="battery-low" />
            <FieldLabel htmlFor="battery-low" className="font-normal">
              Low
            </FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
    </Example>
  );
}

function RadioGroupGrid() {
  return (
    <Example title="Grid Layout">
      <RadioGroup defaultValue="medium" className="grid grid-cols-2 gap-2">
        <FieldLabel htmlFor="size-small">
          <Field orientation="horizontal">
            <RadioGroupItem aria-label="Small" value="small" id="size-small" />
            <div className="font-medium">Small</div>
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="size-medium">
          <Field orientation="horizontal">
            <RadioGroupItem aria-label="Medium" value="medium" id="size-medium" />
            <div className="font-medium">Medium</div>
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="size-large">
          <Field orientation="horizontal">
            <RadioGroupItem aria-label="Large" value="large" id="size-large" />
            <div className="font-medium">Large</div>
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="size-xlarge">
          <Field orientation="horizontal">
            <RadioGroupItem aria-label="X-Large" value="xlarge" id="size-xlarge" />
            <div className="font-medium">X-Large</div>
          </Field>
        </FieldLabel>
      </RadioGroup>
    </Example>
  );
}

function RadioGroupDisabled() {
  return (
    <Example title="Disabled">
      <RadioGroup defaultValue="option2" disabled>
        <Field orientation="horizontal">
          <RadioGroupItem aria-label="Option 1" value="option1" id="disabled-1" />
          <FieldLabel htmlFor="disabled-1" className="font-normal">
            Option 1
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem aria-label="Option 2" value="option2" id="disabled-2" />
          <FieldLabel htmlFor="disabled-2" className="font-normal">
            Option 2
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem aria-label="Option 3" value="option3" id="disabled-3" />
          <FieldLabel htmlFor="disabled-3" className="font-normal">
            Option 3
          </FieldLabel>
        </Field>
      </RadioGroup>
    </Example>
  );
}

function RadioGroupInvalid() {
  return (
    <Example title="Invalid">
      <FieldSet>
        <FieldLegend>Notification Preferences</FieldLegend>
        <FieldDescription>Choose how you want to receive notifications.</FieldDescription>
        <RadioGroup defaultValue="email">
          <Field orientation="horizontal" data-invalid>
            <RadioGroupItem aria-label="Email only" value="email" id="invalid-email" aria-invalid />
            <FieldLabel htmlFor="invalid-email" className="font-normal">
              Email only
            </FieldLabel>
          </Field>
          <Field orientation="horizontal" data-invalid>
            <RadioGroupItem aria-label="SMS only" value="sms" id="invalid-sms" aria-invalid />
            <FieldLabel htmlFor="invalid-sms" className="font-normal">
              SMS only
            </FieldLabel>
          </Field>
          <Field orientation="horizontal" data-invalid>
            <RadioGroupItem
              aria-label="Both Email & SMS"
              value="both"
              id="invalid-both"
              aria-invalid
            />
            <FieldLabel htmlFor="invalid-both" className="font-normal">
              Both Email & SMS
            </FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
    </Example>
  );
}
