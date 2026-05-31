"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { loginUser } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter valid email"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginUser(values.email, values.password);

      toast.success("Login successful");

      router.push("/dashboard");
    } catch (error) {
      toast.error(
        `Invalid credentials - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md rounded-2xl border shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/images/logo.webp"
              alt="Shiv Kariyana Logo"
              width={100}
              height={100}
              loading="lazy"
              unoptimized
              className="object-contain"
            />
            <h1 className="text-lg font-semibold flex text-center">
              Shiv Kariyana and Provision Store
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Secure Invoice Management System
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>

                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        autoComplete="email"
                        disabled={form.formState.isSubmitting}
                        className="
                          h-11
                          focus-visible:ring-2
                          focus-visible:ring-ring
                        "
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>

                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        autoComplete="current-password"
                        disabled={form.formState.isSubmitting}
                        className="
                          h-11
                          focus-visible:ring-2
                          focus-visible:ring-ring
                        "
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="
                  w-full
                  h-11
                  cursor-pointer
                  transition-all
                  hover:bg-primary/80
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                "
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
