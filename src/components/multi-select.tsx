"use client";

import { useEffect, useState } from "react";

import { Check, ChevronsUpDown, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type SelectOption = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: SelectOption[];
  placeholder?: string;
  value: SelectOption[];
  onChangeAction: (value: SelectOption[]) => void;
}

export function MultiSelect({
  options,
  placeholder,
  onChangeAction,
  value: defaultValue,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<SelectOption[]>(defaultValue);
  const [input, setInput] = useState("");

  function handleSetValue(val: SelectOption) {
    if (value.includes(val)) {
      value.splice(value.indexOf(val), 1);
      setValue(value.filter((item) => item !== val));
      onChangeAction(value);
    } else {
      setValue((prevValue) => [...prevValue, val]);
      onChangeAction(value);
    }
  }

  function handleRemoveFromValue(option: SelectOption) {
    setValue((prev) => prev.filter((i) => i.value !== option.value));
    onChangeAction(value);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex justify-start gap-2">
            {value?.length
              ? value.map((val, i) => (
                  <Badge
                    key={i}
                    className="flex items-center justify-between gap-2 bg-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromValue(val);
                    }}
                  >
                    {
                      options
                        .concat({ label: input, value: input })
                        .find((option) => option.value === val.value)?.label
                    }
                  </Badge>
                ))
              : placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={input}
            onValueChange={(value) => setInput(value)}
          />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.concat({ label: input, value: input }).map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    handleSetValue(option);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.some((v) => v.value === option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
