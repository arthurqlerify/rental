// The standard move-out checks, one group per room. Garden is left out for now, as most apartments have none.
export const MOVE_OUT_CHECKLIST: { room: string; items: string[] }[] = [
  {
    room: "Entrance",
    items: ["Front door and lock work; all keys returned", "Doorbell and intercom work"],
  },
  {
    room: "Living room",
    items: [
      "Walls and ceiling free of holes and stains",
      "Floor undamaged; no burns or deep scratches",
      "Windows open and close; no cracked glass",
    ],
  },
  {
    room: "Kitchen",
    items: [
      "Oven and hob clean and working",
      "Fridge and freezer empty and defrosted",
      "Sink and tap free of leaks",
      "Extractor fan filter clean",
    ],
  },
  {
    room: "Bathroom",
    items: ["Toilet flushes; no leaks", "Shower and drains run freely", "Tiles and grout intact; no mould"],
  },
  {
    room: "Bedroom",
    items: ["Walls and ceiling free of holes and stains", "Wardrobe doors and hinges intact"],
  },
  {
    room: "Utility",
    items: ["Smoke alarm tested and working", "Meter readings for electricity and water recorded"],
  },
];

// The inspection's checklist field holds the ticked items as text, one "Room: item" per line.
// The room is part of each line because some items, such as the walls and ceiling, appear in more than one room.
export const checklistItemKey = (room: string, item: string) => `${room}: ${item}`;

export const parseChecklist = (checklist?: string): string[] =>
  checklist ? checklist.split("\n").map((line) => line.trim()).filter(Boolean) : [];

// Lists the ticked items in checklist order, whatever order they were ticked in
export const formatChecklist = (ticked: string[]): string =>
  MOVE_OUT_CHECKLIST.flatMap(({ room, items }) => items.map((item) => checklistItemKey(room, item)))
    .filter((key) => ticked.includes(key))
    .join("\n");
