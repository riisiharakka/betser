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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const createBetSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  endTime: z.string().min(1, "End time is required"),
});

type CreateBetForm = z.infer<typeof createBetSchema>;

const CreateBet = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CreateBetForm>({
    resolver: zodResolver(createBetSchema),
    defaultValues: {
      eventName: "",
      optionA: "",
      optionB: "",
      endTime: "",
    },
  });

  const onSubmit = async (data: CreateBetForm) => {
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
        end_time: new Date(data.endTime).toISOString(),
        pool_a: 0,
        pool_b: 0,
        is_resolved: false,
        created_by: sessionData.session.user.id,
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Bet</h1>
          <p className="text-muted-foreground">
            Set up a new betting event with two options
          </p>
        </div>

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
                    <Input type="datetime-local" {...field} />
                  </FormControl>
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
      </div>
    </div>
  );
};

export default CreateBet;