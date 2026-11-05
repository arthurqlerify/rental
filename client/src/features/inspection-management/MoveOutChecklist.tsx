import { useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { MOVE_OUT_CHECKLIST, checklistItemKey } from "./moveOutChecklistItems";

interface MoveOutChecklistProps {
  ticked: string[];
  onTickedChange?: (ticked: string[]) => void;
  disabled?: boolean;
}

export const MoveOutChecklist = ({ ticked, onTickedChange, disabled }: MoveOutChecklistProps) => {
  const baseId = useId();

  return (
    <div className="space-y-3">
      {MOVE_OUT_CHECKLIST.map(({ room, items }, roomIndex) => (
        // Each room is a fieldset whose legend names the room, as the W3C forms tutorial on grouping controls
        // describes, so a screen reader announces the room before its items
        <fieldset key={room} className="space-y-2 rounded-lg border px-3 pb-3 pt-1">
          <legend className="px-1 text-sm font-medium">{room}</legend>
          {items.map((item, itemIndex) => {
            const key = checklistItemKey(room, item);
            const id = `${baseId}-${roomIndex}-${itemIndex}`;
            return (
              <div key={key} className="flex items-start gap-2">
                <Checkbox
                  id={id}
                  checked={ticked.includes(key)}
                  disabled={disabled}
                  onCheckedChange={(checked) =>
                    onTickedChange?.(checked === true ? [...ticked, key] : ticked.filter((k) => k !== key))
                  }
                />
                <Label htmlFor={id} className="font-normal leading-tight">
                  {item}
                </Label>
              </div>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
};
