import { getUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import ExchangeOnboarding from '@/components/shared/ExchangeOnboarding'

const page = async () => {
  const user = await getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  if (user.onboarded) {
    return redirect('/d')
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Connect Your Exchange</h1>
      <p className="text-gray-300 mb-8">
        To get started, connect at least one cryptocurrency exchange. We use bank-grade 
        encryption to keep your API keys secure.
      </p>
      
      {/* Client component for the form */}
      <ExchangeOnboarding userId={user.id} />
    </div>
  )
}

export default page