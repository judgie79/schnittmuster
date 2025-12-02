import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GlobalProvider } from '@/context'
import { AppRouter } from '@/router'
import { ToastStack } from '@/components/common/Toast/ToastStack'

const queryClient = new QueryClient()

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
