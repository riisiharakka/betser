import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  // Ensure we have a valid date, fallback to current time if invalid
  const validDate = date instanceof Date && !isNaN(date.getTime()) 
    ? date 
    : new Date();
    
  const [selectedTime, setSelectedTime] = React.useState(
    format(validDate, "HH:mm")
  );

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(validDate);
    newDate.setHours(hours, minutes);
    setDate(newDate);
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal w-[200px]",
              !validDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {validDate ? format(validDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={validDate}
            onSelect={(newDate) => {
              if (newDate) {
                const [hours, minutes] = selectedTime.split(":").map(Number);
                newDate.setHours(hours, minutes);
                setDate(newDate);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Input
        type="time"
        value={selectedTime}
        onChange={(e) => handleTimeChange(e.target.value)}
        className="w-[150px]"
      />
    </div>
  );
}