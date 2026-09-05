<script setup lang="ts">
import type { DateRange, DateValue } from "reka-ui";
import type { Ref } from "vue";
import { getLocalTimeZone, today } from "@internationalized/date";
import { Check } from "@lucide/vue";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { toast } from "vue-sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { PinInput, PinInputGroup, PinInputSlot } from "@/components/ui/pin-input";
import { RangeCalendar } from "@/components/ui/range-calendar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toaster } from "@/components/ui/sonner";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from "@/components/ui/tags-input";

// Calendar
const meetingDate = ref(today(getLocalTimeZone())) as Ref<DateValue>;

// Range calendar
const retreatRange = ref({
  start: today(getLocalTimeZone()),
  end: today(getLocalTimeZone()).add({ days: 4 }),
}) as Ref<DateRange>;

// Carousel
const carouselSlides = ["Brake Light Clinic", "ABCs of Organizing", "General Meeting"];

// Combobox
const areaCities = ["Downtown", "Northside", "Southside", "Eastside", "Westside"];
const selectedCity = ref("");

// Form (vee-validate + zod)
const formSchema = toTypedSchema(
  z.object({
    email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  }),
);
const { handleSubmit } = useForm({ validationSchema: formSchema });
const onSubmit = handleSubmit((values) => {
  toast.success("You're on the list", {
    description: `Chapter updates headed to ${values.email}.`,
  });
});

// Number field
const rideSeats = ref(2);

// Pin input
const pinValue = ref<string[]>([]);

// Stepper
const memberSteps = [
  { step: 1, title: "Join", description: "Become a dues-paying member" },
  { step: 2, title: "Orient", description: "New member orientation" },
  { step: 3, title: "Organize", description: "Plug into a committee" },
];

// Tags input
const committeeTags = ref(["Labor", "Mutual Aid"]);
</script>

<template>
  <div class="styleguide-data">
    <section :id="'sg-calendar'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Calendar
      </h2>
      <Calendar v-model="meetingDate" class="inline-block border-2 border-ink bg-white" />
      <p class="mt-4 text-sm">
        Next meeting: <span class="font-bold">{{ meetingDate.toString() }}</span>
      </p>
    </section>

    <section :id="'sg-range-calendar'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Range calendar
      </h2>
      <RangeCalendar v-model="retreatRange" class="inline-block border-2 border-ink bg-white" />
      <p class="mt-4 text-sm">Pick the organizer retreat window.</p>
    </section>

    <section :id="'sg-carousel'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Carousel
      </h2>
      <div class="mx-14 max-w-md">
        <Carousel>
          <CarouselContent>
            <CarouselItem v-for="(slide, i) in carouselSlides" :key="slide">
              <div
                class="flex h-40 items-center justify-center border-2 border-ink bg-[repeating-linear-gradient(45deg,var(--color-stripe-a),var(--color-stripe-a)_12px,var(--color-stripe-b)_12px,var(--color-stripe-b)_24px)]"
              >
                <span class="border-2 border-ink bg-white px-3 py-1 font-display text-sm font-extrabold uppercase">
                  {{ i + 1 }}. {{ slide }}
                </span>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>

    <section :id="'sg-combobox'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Combobox
      </h2>
      <Combobox v-model="selectedCity">
        <ComboboxAnchor class="w-full max-w-sm border-2 border-ink bg-white">
          <ComboboxInput placeholder="Search cities…" />
        </ComboboxAnchor>
        <ComboboxList class="w-60">
          <ComboboxEmpty>No city found.</ComboboxEmpty>
          <ComboboxGroup heading="Cities">
            <ComboboxItem v-for="city in areaCities" :key="city" :value="city">
              {{ city }}
              <ComboboxItemIndicator>
                <Check class="ml-auto size-4" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
      </Combobox>
    </section>

    <section :id="'sg-command'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Command
      </h2>
      <Command class="max-w-md">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Chapter">
            <CommandItem value="upcoming-events">Upcoming events</CommandItem>
            <CommandItem value="meeting-minutes">Meeting minutes</CommandItem>
            <CommandItem value="chapter-bylaws">Chapter bylaws</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Organize">
            <CommandItem value="join-committee">Join a committee</CommandItem>
            <CommandItem value="volunteer-action">Volunteer for an action</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </section>

    <section :id="'sg-form-validation'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Form
      </h2>
      <form class="max-w-sm space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="you@progressnow.org" v-bind="componentField" />
            </FormControl>
            <FormDescription>Chapter updates only — no spam, ever.</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button type="submit">Join the list</Button>
      </form>
    </section>

    <section :id="'sg-input-otp'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Input OTP
      </h2>
      <div class="space-y-3">
        <Label for="sg-otp" class="font-display font-bold uppercase">Verification code</Label>
        <InputOTP id="sg-otp" :maxlength="6">
          <InputOTPGroup>
            <InputOTPSlot v-for="index in 3" :key="index" :index="index - 1" />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot v-for="index in 3" :key="index" :index="index + 2" />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </section>

    <section :id="'sg-number-field'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Number field
      </h2>
      <NumberField v-model="rideSeats" :min="1" :max="6" class="max-w-[180px]">
        <Label for="sg-seats" class="font-display font-bold uppercase">Carpool seats</Label>
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput id="sg-seats" />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>
    </section>

    <section :id="'sg-pin-input'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Pin input
      </h2>
      <div class="space-y-3">
        <Label for="sg-pin" class="font-display font-bold uppercase">Door code</Label>
        <PinInput id="sg-pin" v-model="pinValue" placeholder="○">
          <PinInputGroup>
            <PinInputSlot v-for="(id, index) in 4" :key="id" :index="index" />
          </PinInputGroup>
        </PinInput>
      </div>
    </section>

    <section :id="'sg-resizable'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Resizable
      </h2>
      <ResizablePanelGroup
        direction="horizontal"
        class="h-[180px] max-w-md border-2 border-ink bg-white"
      >
        <ResizablePanel :default-size="55">
          <div class="flex h-full items-center justify-center p-6">
            <span class="font-display text-sm font-extrabold uppercase">Agenda</span>
          </div>
        </ResizablePanel>
        <ResizableHandle with-handle />
        <ResizablePanel :default-size="45">
          <div class="flex h-full items-center justify-center p-6">
            <span class="font-display text-sm font-extrabold uppercase">Minutes</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </section>

    <section :id="'sg-sonner'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Sonner
      </h2>
      <div class="flex flex-wrap gap-6">
        <Button
          @click="toast('New event posted', { description: 'Brake Light Clinic — Jul 12, Downtown' })"
        >
          Show toast
        </Button>
        <Button
          variant="secondary"
          @click="toast.success('RSVP confirmed', { description: 'See you at the general meeting.' })"
        >
          Show success toast
        </Button>
      </div>
    </section>

    <section :id="'sg-stepper'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Stepper
      </h2>
      <Stepper :default-value="2" class="flex w-full max-w-xl items-start gap-2">
        <StepperItem
          v-for="item in memberSteps"
          :key="item.step"
          class="relative flex w-full flex-col items-center justify-center"
          :step="item.step"
        >
          <StepperSeparator
            v-if="item.step !== memberSteps.length"
            class="absolute left-[calc(50%+24px)] right-[calc(-50%+16px)] top-5 block h-0.5 shrink-0"
          />
          <StepperTrigger>
            <StepperIndicator>{{ item.step }}</StepperIndicator>
            <div class="flex flex-col items-center">
              <StepperTitle>{{ item.title }}</StepperTitle>
              <StepperDescription class="hidden sm:block">
                {{ item.description }}
              </StepperDescription>
            </div>
          </StepperTrigger>
        </StepperItem>
      </Stepper>
    </section>

    <section :id="'sg-tags-input'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Tags input
      </h2>
      <div class="max-w-sm space-y-3">
        <Label for="sg-committees" class="font-display font-bold uppercase">Committees</Label>
        <TagsInput id="sg-committees" v-model="committeeTags">
          <TagsInputItem v-for="item in committeeTags" :key="item" :value="item">
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput placeholder="Add a committee…" />
        </TagsInput>
      </div>
    </section>

    <section :id="'sg-data-table-date-picker'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Data table / Date picker
      </h2>
      <p class="max-w-[60ch] text-sm">
        Not installed as registry items — both are composition patterns. A data table composes
        <code class="font-mono font-bold">Table</code> with
        <code class="font-mono font-bold">@tanstack/vue-table</code>; a date picker composes
        <code class="font-mono font-bold">Popover</code> with
        <code class="font-mono font-bold">Calendar</code>.
      </p>
    </section>

    <Toaster />
  </div>
</template>
