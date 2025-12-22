import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setApiBaseUrl } from '@schnittmuster/core'
import { GlobalProvider } from '@/context'
import { AppRouter } from '@/router'
import { ToastStack } from '@/components/common/Toast/ToastStack'
import { API_BASE_URL } from '@/utils/constants'

const queryClient = new QueryClient()

// Configure API base URL for core package
setApiBaseUrl(API_BASE_URL)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalProvider>
        <AppRouter />
        <ToastStack />
      </GlobalProvider>
    </QueryClientProvider>
  )
}

export default App
