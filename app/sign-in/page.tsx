import { auth } from '@/auth'
import { FooterText } from '@/components/footer'
import { LoginButton } from '@/components/login-button'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  const session = await auth()
  // redirect to home if user is already logged in
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex min-h-screen items-start justify-center px-4 pt-16 pb-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
              #desys
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Your GPT4o-powered conversation companion
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Welcome back GPT-4o
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to continue your conversations
              </p>
            </div>

            <div className="flex justify-center">
              <LoginButton />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                By signing in, you agree to our terms and privacy policy
              </p>
            </div>

            <div className="mt-4">
              <FooterText />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
