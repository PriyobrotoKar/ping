import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod/v3";
import { Button } from "@/components/ui/button";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useAuth } from "@/providers/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Logo from "@/components/Logo";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

function RouteComponent() {
  const { login } = useAuth();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onError: (error) => {
      console.error("Login failed:", error);
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <div className="min-h-svh flex justify-center items-center">
        <main className="border p-9 space-y-6 max-w-[26rem] w-full rounded-xl">
          <header className="space-y-2">
            <Logo type="icon" width={40} height={40} />
            <h1 className="text-xl font-medium">Welcome to Ping</h1>
            <p className="text-muted-foreground">
              Next-get Realtime Chat App for you
            </p>
          </header>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="email"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="johndoe@gmail.com"
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                name="password"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          placeholder="********"
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              <Button className="w-full">Login</Button>
            </form>
          </Form>
          <div className="text-center relative">
            <hr className="absolute w-full top-1/2 -translate-y-1/2" />
            <span className="text-sm text-muted-foreground relative z-10 bg-card px-4">
              or continue with
            </span>
          </div>

          <Button className="w-full">
            <IconBrandGoogleFilled /> Login with Google
          </Button>

          <p className="text-muted-foreground text-sm text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-foreground underline">
              Sign Up
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
