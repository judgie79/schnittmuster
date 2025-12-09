import { useAuth } from '@/hooks'
import { FaUser, FaEnvelope, FaGoogle, FaEdit } from 'react-icons/fa'

export const ProfileScreen = () => {
  const { state, logout } = useAuth()
  const user = state.user

  if (!user) {
    return <div className="p-4 text-center">Bitte einloggen.</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-border flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <FaUser size={40} />
          )}
        </div>
        
        <h2 className="text-xl font-bold text-text">{user.username}</h2>
        <div className="flex items-center gap-2 text-text-muted mt-1">
          <FaEnvelope size={14} />
          <span>{user.email}</span>
        </div>
        
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border text-sm text-text-muted">
          {user.authProvider === 'google' ? <FaGoogle size={14} /> : <FaUser size={14} />}
          <span>Angemeldet via {user.authProvider === 'google' ? 'Google' : 'E-Mail'}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full flex items-center justify-between p-4 bg-surface rounded-xl border border-border shadow-sm hover:bg-background transition-colors">
          <span className="font-medium flex items-center gap-3">
            <FaEdit className="text-primary" />
            Profil bearbeiten
          </span>
          <span className="text-text-muted">→</span>
        </button>
        
        <button 
          onClick={() => logout()}
          className="w-full p-4 text-error font-medium bg-surface rounded-xl border border-border shadow-sm hover:bg-error/5 transition-colors"
        >
          Abmelden
        </button>
      </div>
    </div>
  )
}

