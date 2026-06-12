import { PageLayout } from '@/components/layout'
import ProfileInfo from './ProfileInfo'

const ProfilePage = () => {
  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px]">
        <div className="pt-36 sm:pt-44 lg:pt-[200px]">
          <h2 className="font-outfit font-semibold text-3xl sm:text-3xl md:text-3xl text-primary-dark mb-8 sm:mb-10 lg:mb-[50px]">
            PROFILE
          </h2>
          <ProfileInfo />
        </div>
      </div>
    </PageLayout>
  )
}

export default ProfilePage
