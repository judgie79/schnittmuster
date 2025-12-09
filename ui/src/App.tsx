import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GlobalProvider } from '@/context'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppRouter } from '@/router'
import { ToastStack } from '@/components/common/Toast/ToastStack'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GlobalProvider>
          <AppRouter />
          <ToastStack />
        </GlobalProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

