import FitnessCalendarApp from '@/components/FitnessCalendarApp'
import AuthWrapper from '@/components/AuthWrapper'

export default function Home() {
  return (
    <AuthWrapper>
      <FitnessCalendarApp />
    </AuthWrapper>
  )
} 