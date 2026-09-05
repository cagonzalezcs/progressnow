<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const faqItems = [
  {
    value: "faq-1",
    question: "Do I have to be a member to attend events?",
    answer:
      "No. General meetings, brake light clinics, and political education nights are open to everyone in our community. Only chapter votes require membership.",
  },
  {
    value: "faq-2",
    question: "How do I join a committee?",
    answer:
      "Show up to a general meeting or email the committee co-chairs. Mutual Aid, Labor, Political Education, and Electoral all welcome new members year-round.",
  },
  {
    value: "faq-3",
    question: "What does mutual aid actually look like here?",
    answer:
      "Free brake light replacements, community fridge restocks, and disaster response across every neighborhood in our community.",
  },
];

const scrollEvents = [
  "Jul 12 — Brake Light Clinic, Downtown",
  "Jul 19 — ABCs of Organizing, Central Library",
  "Jul 26 — General Meeting, Union Hall",
  "Aug 02 — Community Fridge Restock, Community Center",
  "Aug 09 — Labor Committee Roundtable, Neighborhood Center",
  "Aug 16 — Electoral Working Group, Eastside",
  "Aug 23 — Political Education Night, Corner Café",
  "Aug 30 — Mutual Aid Supply Drive, Riverside Park",
  "Sep 06 — General Meeting, Downtown",
  "Sep 13 — Brake Light Clinic, Community Center",
];
</script>

<template>
  <div class="styleguide-overlays">
    <section :id="'sg-accordion'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Accordion
      </h2>
      <Accordion type="single" collapsible class="max-w-xl" default-value="faq-1">
        <AccordionItem v-for="item in faqItems" :key="item.value" :value="item.value">
          <AccordionTrigger>{{ item.question }}</AccordionTrigger>
          <AccordionContent>{{ item.answer }}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>

    <section :id="'sg-alert-dialog'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Alert dialog
      </h2>
      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button variant="destructive">Cancel my RSVP</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel RSVP for the brake light clinic?</AlertDialogTitle>
            <AlertDialogDescription>
              We plan bulbs, tools, and volunteer shifts around headcount. You can always RSVP
              again if your Saturday frees up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my RSVP</AlertDialogCancel>
            <AlertDialogAction>Cancel it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>

    <section :id="'sg-collapsible'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Collapsible
      </h2>
      <Collapsible class="max-w-md">
        <CollapsibleTrigger as-child>
          <Button variant="outline">Show all committees</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul class="mt-4 space-y-2 border-2 border-ink bg-white p-4 text-sm">
            <li class="font-bold">Mutual Aid — brake lights, fridges, disaster response</li>
            <li class="font-bold">Political Education — reading groups, ABCs of Organizing</li>
            <li class="font-bold">Labor — workplace organizing and strike support</li>
            <li class="font-bold">Electoral — candidate endorsements and canvassing</li>
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </section>

    <section :id="'sg-context-menu'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Context menu
      </h2>
      <ContextMenu>
        <ContextMenuTrigger
          class="flex h-32 max-w-md items-center justify-center border-2 border-dashed border-ink bg-white text-sm font-bold uppercase"
        >
          Right-click an event card
        </ContextMenuTrigger>
        <ContextMenuContent class="w-56">
          <ContextMenuLabel>General Meeting — Jul 26</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>RSVP</ContextMenuItem>
          <ContextMenuItem>Add to calendar</ContextMenuItem>
          <ContextMenuItem>Copy event link</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">Report a problem</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </section>

    <section :id="'sg-dialog'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Dialog
      </h2>
      <Dialog>
        <DialogTrigger as-child>
          <Button>Join a committee</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a committee</DialogTitle>
            <DialogDescription>
              Committees are where chapter work actually happens. Pick one and a co-chair will
              reach out before the next general meeting.
            </DialogDescription>
          </DialogHeader>
          <p class="text-sm">
            Mutual Aid meets first Saturdays, Labor meets second Tuesdays, Political Education
            meets third Thursdays, and Electoral meets as campaigns demand.
          </p>
          <DialogFooter>
            <Button variant="outline">Maybe later</Button>
            <Button>Sign me up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>

    <section :id="'sg-dropdown-menu'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Dropdown menu
      </h2>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">Committees</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56">
          <DropdownMenuLabel>Get involved</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Mutual Aid</DropdownMenuItem>
          <DropdownMenuItem>Political Education</DropdownMenuItem>
          <DropdownMenuItem>Labor</DropdownMenuItem>
          <DropdownMenuItem>Electoral</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Start a new committee</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </section>

    <section :id="'sg-hover-card'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Hover card
      </h2>
      <HoverCard>
        <HoverCardTrigger as-child>
          <Button variant="link">@progressnow</Button>
        </HoverCardTrigger>
        <HoverCardContent class="w-80">
          <p class="font-display font-extrabold uppercase">Progress Now</p>
          <p class="mt-2 text-sm">
            Organizing working people across every neighborhood in our community.
            Mutual aid, labor solidarity, and political education since day one.
          </p>
        </HoverCardContent>
      </HoverCard>
    </section>

    <section :id="'sg-menubar'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Menubar
      </h2>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Chapter</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>About us</MenubarItem>
            <MenubarItem>Bylaws</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Become a member</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Events</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Calendar</MenubarItem>
            <MenubarItem>General meetings</MenubarItem>
            <MenubarItem>Brake light clinics</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Committees</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Mutual Aid</MenubarItem>
            <MenubarItem>Labor</MenubarItem>
            <MenubarItem>Political Education</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </section>

    <section :id="'sg-navigation-menu'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Navigation menu
      </h2>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Get involved</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="grid w-[320px] gap-1 p-1">
                <li>
                  <NavigationMenuLink href="#">
                    <span class="font-bold">Committees</span>
                    <span class="text-muted-foreground text-xs">
                      Mutual aid, labor, political education, electoral
                    </span>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#">
                    <span class="font-bold">Events</span>
                    <span class="text-muted-foreground text-xs">
                      Meetings and actions across our community
                    </span>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink href="#">
                    <span class="font-bold">Membership</span>
                    <span class="text-muted-foreground text-xs">Join us today</span>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" class="px-4 py-2 font-medium">
              Calendar
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <p class="text-muted-foreground mt-4 max-w-md text-xs">
        Open "Get involved" to see the viewport panel — white fill, ink border, soft popover shadow.
      </p>
    </section>

    <section :id="'sg-popover'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Popover
      </h2>
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline">What is mutual aid?</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p class="font-display font-extrabold uppercase">Mutual aid</p>
          <p class="mt-2 text-sm">
            Neighbors meeting each other's needs directly — not charity, but solidarity. Our
            clinics and fridge restocks are organized by and for the community.
          </p>
        </PopoverContent>
      </Popover>
    </section>

    <section :id="'sg-scroll-area'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Scroll area
      </h2>
      <ScrollArea class="h-48 max-w-md border-2 border-ink bg-white p-4">
        <p class="mb-3 font-display text-sm font-extrabold uppercase">Upcoming events</p>
        <ul class="space-y-2">
          <li
            v-for="event in scrollEvents"
            :key="event"
            class="border-b border-line pb-2 text-sm"
          >
            {{ event }}
          </li>
        </ul>
      </ScrollArea>
    </section>

    <section :id="'sg-sheet'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Sheet
      </h2>
      <Sheet>
        <SheetTrigger as-child>
          <Button>Open chapter menu</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Progress Now</SheetTitle>
            <SheetDescription>Chapter navigation, styleguide demo.</SheetDescription>
          </SheetHeader>
          <nav class="flex flex-col gap-3 p-4">
            <a href="#" class="font-display font-bold uppercase">Events</a>
            <a href="#" class="font-display font-bold uppercase">Committees</a>
            <a href="#" class="font-display font-bold uppercase">Mutual Aid</a>
            <a href="#" class="font-display font-bold uppercase">Join</a>
          </nav>
          <SheetFooter>
            <Button>Become a member</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </section>

    <section :id="'sg-sidebar'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Sidebar
      </h2>
      <p class="text-muted-foreground max-w-md text-sm">
        Sidebar: composite component, demoed in app chrome.
      </p>
    </section>

    <section :id="'sg-tabs'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Tabs
      </h2>
      <Tabs default-value="upcoming" class="max-w-md">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <p class="border-2 border-ink bg-white p-4 text-sm">
            Brake Light Clinic (Jul 12), ABCs of Organizing (Jul 19), and the General Meeting
            (Jul 26) are all open to the public.
          </p>
        </TabsContent>
        <TabsContent value="past">
          <p class="border-2 border-ink bg-white p-4 text-sm">
            June's community fridge restock served four sites across the city. Thanks to
            all 23 volunteers.
          </p>
        </TabsContent>
      </Tabs>
    </section>

    <section :id="'sg-tooltip'" class="mb-16">
      <h2 class="mb-6 border-b-[3px] border-ink pb-2 font-display text-2xl font-extrabold uppercase">
        Tooltip
      </h2>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline">Hover for dues info</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dues are income-based — no one is turned away.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </section>
  </div>
</template>
