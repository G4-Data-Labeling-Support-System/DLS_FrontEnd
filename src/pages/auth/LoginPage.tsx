import { useAuth } from '@/features/auth/hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button' // Assuming this is still used or replaced later
import type { User } from '@/shared/types/api.types'
import type { AxiosError } from 'axios'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().min(1, { message: "Please enter your email" }).email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Please enter your password" }),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setErrorMessage(null)
    const { email, password } = values

    try {
      const user = await login({ email, password })

      if (user) {
        // Redirection logic based on role
        const typedUser = user as User
        const role = (typedUser.userRole || typedUser.role || '').toLowerCase()

        if (role === 'admin') {
          navigate('/admin/dashboard')
        } else if (role === 'manager') {
          navigate('/manager')
        } else if (role === 'annotator') {
          navigate('/annotator')
        } else if (role === 'reviewer') {
          navigate('/reviewer')
        } else {
          navigate('/')
        }
      } else {
        setErrorMessage('Invalid username or password. Please try again.')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; code?: number }>
      const status = axiosError.response?.status
      const serverMsg = axiosError.response?.data?.message

      if (status === 400 || status === 401 || status === 403) {
        setErrorMessage('Invalid username or password. Please check and try again.')
      } else if (status === 404) {
        setErrorMessage('User not found.')
      } else if (status === 500) {
        setErrorMessage('Internal Server Error. Please contact support.')
      } else {
        setErrorMessage(serverMsg || axiosError.message || 'An unexpected error occurred')
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f1f1f1] text-[#111] overflow-hidden font-sans">
      
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative p-8 lg:p-16">
        
        {/* Top Logo */}
        <div className="flex items-center gap-3 absolute top-8 left-8 lg:left-12">
          <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-[#111]">Annotationary</span>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            {/* Headers */}
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold tracking-tight text-[#111] mb-1">
                Welcome to Annotationary
              </h1>
              <p className="text-2xl font-bold tracking-tight text-[#555]">
                Start annotating now
              </p>
            </div>

            {errorMessage && (
              <div className="w-full mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                {errorMessage}
              </div>
            )}

            {/* Login Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormControl>
                        <Input 
                          placeholder="Enter your email" 
                          {...field} 
                          className="h-[52px] bg-[#e5e5e5] hover:bg-[#dcdcdc] focus:bg-[#dcdcdc] border-transparent focus:border-transparent rounded-xl px-4 text-sm text-[#111] placeholder:text-[#888] placeholder:font-medium transition-colors"
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
                    <FormItem className="mb-8">
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Enter your password" 
                          {...field} 
                          className="h-[52px] bg-[#e5e5e5] hover:bg-[#dcdcdc] focus:bg-[#dcdcdc] border-transparent focus:border-transparent rounded-xl px-4 text-sm text-[#111] placeholder:text-[#888] placeholder:font-medium transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full h-[52px] px-4 bg-[#111] text-white rounded-xl font-semibold hover:bg-black transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Continue'}
                </Button>
              </form>
            </Form>
            
          </div>
        </div>
      </div>

      {/* Right Column - Decorative Grid */}
      <div className="hidden lg:flex w-1/2 p-6 items-center justify-center h-screen">
        <div className="w-full h-full max-h-[900px] grid grid-cols-2 gap-4 lg:gap-6 pr-6">
          
          {/* Left Column of Grid */}
          <div className="flex flex-col gap-4 lg:gap-6 pt-12">
            <div className="bg-[#e0e0e0] rounded-[24px] w-full aspect-square"></div>
            <div className="bg-[#e0e0e0] rounded-[24px] w-full aspect-[4/5]"></div>
            <div className="bg-[#e0e0e0] rounded-[24px] w-full aspect-[4/3]"></div>
          </div>

          {/* Right Column of Grid */}
          <div className="flex flex-col gap-4 lg:gap-6 pb-12">
            <div className="bg-[#e0e0e0] rounded-[24px] w-full aspect-[4/5]"></div>
            <div className="bg-[#e0e0e0] rounded-[24px] w-full aspect-[4/5]"></div>
            <div className="bg-[#e0e0e0] rounded-[24px] w-full aspect-square"></div>
          </div>
          
        </div>
      </div>

    </div>
  )
}
