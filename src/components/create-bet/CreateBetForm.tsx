import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DateTimePicker } from "./DateTimePicker";

const createBetSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  endTime: z.date({
    required_error: "End time is required",
  }).refine((date) => date > new Date(), {
    message: "End time must be in the future",
  }),
  maxBetSize: z.string().optional().transform((val) => {
    if (!val) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }),
});

export type CreateBetFormValues = z.infer<typeof createBetSchema>;

export const CreateBetForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CreateBetFormValues>({
    resolver: zodResolver(createBetSchema),
    defaultValues: {
      eventName: "",
      optionA: "",
      optionB: "",
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
      maxBetSize: "",
    },
  });

  const onSubmit = async (data: CreateBetFormValues) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast({
          title: "Error",
          description: "You must be logged in to create a bet",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("bets").insert({
        event_name: data.eventName,
        option_a: data.optionA,
        option_b: data.optionB,
        end_time: data.endTime.toISOString(),
        pool_a: 0,
        pool_b: 0,
        is_resolved: false,
        created_by: sessionData.session.user.id,
        max_bet_size: data.maxBetSize,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bet created successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Error creating bet:", error);
      toast({
        title: "Error",
        description: "Failed to create bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter event name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="optionA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Option A</FormLabel>
              <FormControl>
                <Input placeholder="Enter first option" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="optionB"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Option B</FormLabel>
              <FormControl>
                <Input placeholder="Enter second option" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <DateTimePicker 
                  date={field.value} 
                  setDate={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxBetSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Bet Size (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter maximum bet size" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Leave empty for no maximum bet size limit
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button type="submit">Create Bet</Button>
        </div>
      </form>
    </Form>
  );
};