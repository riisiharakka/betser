import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreateBetFormValues } from "./CreateBetForm";

interface DareFieldsProps {
  form: UseFormReturn<CreateBetFormValues>;
}

export const DareFields = ({ form }: DareFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="stake"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Stake</FormLabel>
          <FormControl>
            <Input 
              placeholder="What's at stake? (e.g., 1 beer, 2 coffees)" 
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Describe what the loser has to do or give
          </FormDescription>
        </FormItem>
      )}
    />
  );
};