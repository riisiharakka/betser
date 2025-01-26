import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreateBetFormValues } from "./CreateBetForm";

interface TimeInputsProps {
  form: UseFormReturn<CreateBetFormValues>;
}

export const TimeInputs = ({ form }: TimeInputsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="days"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Days</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0"
                placeholder="Days"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hours</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0"
                max="23"
                placeholder="Hours"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="minutes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minutes</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0"
                max="59"
                placeholder="Minutes"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};