import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { User, Lock, Eye, EyeOff, GraduationCap, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import axios from 'axios';
import { post } from '@/lib/api-utils';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
  rememberMe: z.boolean().optional(),
});

export default function StudentLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values) {
    setLoading(true);

    try {
      const response = await post('/studentLogin', values, null);

      if (response.success) {
        toast.success(response.message || 'Login successful!');
        localStorage.setItem('token', response.token);
        localStorage.setItem('student', JSON.stringify(response.student));
        router.push('/student');
      } else {
        toast.error(response.message || 'Invalid username or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      router.push('/student');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 px-4 py-8 sm:py-12 relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <Card className="w-full shadow-2xl border-0 backdrop-blur-md bg-card/98 relative overflow-hidden group">
          <CardHeader className="bg-gradient-to-b from-card/50 to-transparent relative">
            {/* Icon with enhanced styling */}
            <CardTitle className="text-center my-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl shadow-md ring-1 ring-primary/10">
                <GraduationCap className="w-10 h-10 text-primary drop-shadow-sm" />
              </div>
            </CardTitle>

            <div className="space-y-3">
              <CardDescription className="text-center text-base text-muted-foreground/90 font-medium leading-relaxed">
                Sign in to access your student portal
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-8 pt-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold text-foreground/90 tracking-wide">Username</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                          </div>
                          <Input
                            placeholder="Enter your username"
                            {...field}
                            type="text"
                            value={field.value.replace(/\s+/g, '')}
                            className="pl-11 pr-4 h-12 bg-background/50 text-base font-medium placeholder:text-muted-foreground/60"
                          />
                          {/* Focus glow effect */}
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-destructive font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold text-foreground/90 tracking-wide">Password</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200">
                            <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                          </div>
                          <Input
                            placeholder="Enter your password"
                            {...field}
                            value={field.value.replace(/\s+/g, '')}
                            type={showPassword ? 'text' : 'password'}
                            className="pl-11 pr-12 h-12 bg-background/50 text-base font-medium placeholder:text-muted-foreground/60"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-background/80 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                          {/* Focus glow effect */}
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-destructive font-medium" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] rounded-xl shadow-md hover:shadow-primary/25 relative overflow-hidden group"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span className="font-medium">Signing in...</span>
                      </div>
                    ) : (
                      <span className="relative z-10">Sign In</span>
                    )}
                  </Button>
                </div>

                <div className="text-center pt-3">
                  <Link
                    href="https://esamwad.iotcom.io/dashboard/login"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-all duration-200 underline-offset-4 hover:underline font-medium group"
                  >
                    Back to Admin Login <LogIn className="ms-2 text-xs" size={18} />
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
