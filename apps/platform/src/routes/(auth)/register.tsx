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
import { useMutation } from "@tanstack/react-query";
import AuthService from "@/api/services/auth";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import Logo from "@/components/Logo";

export const Route = createFileRoute("/(auth)/register")({
  component: RouteComponent,
});

const registerSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

function RouteComponent() {
  const { login } = useAuth();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerSchema>) =>
      AuthService.register({
        email: data.email,
        password: data.password,
        fullName: `${data.firstname} ${data.lastname}`,
      }),
    onSuccess: (data, variables) => {
      console.log("Registration successful:", data);
      login({
        email: data.email,
        password: variables.password,
      });
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      toast.error(error.message);
    },
  });

  const onSumit = (data: z.infer<typeof registerSchema>) => {
    console.log(data);
    mutation.mutate(data);
  };

  return (
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
          <form onSubmit={form.handleSubmit(onSumit)} className="space-y-4">
            <div className="flex gap-6">
              <FormField
                name="firstname"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John" />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                name="lastname"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Doe" />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </div>
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
                        {...field}
                        type="password"
                        placeholder="********"
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <Button className="w-full">Create Account</Button>
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
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline">
            Sign In
          </Link>
        </p>
      </main>
    </div>
  );
}
