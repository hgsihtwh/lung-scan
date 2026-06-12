import { PageLayout } from '@/components/layout'
import { AuthForm } from '@/components/auth'

const AuthPage = () => {
  return (
    <PageLayout>
      <div className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-36 sm:pt-44 lg:pt-[200px] pb-12 sm:pb-16 md:pb-20 w-full">
        <AuthForm />
      </div>
    </PageLayout>
  )
}

export default AuthPage
