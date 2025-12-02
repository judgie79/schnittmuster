import { Link } from 'react-router-dom'

export const NotFoundScreen = () => (
  <section style={{ padding: '32px', textAlign: 'center' }}>
    <h2>Seite nicht gefunden</h2>
    <p>Diese Seite existiert nicht oder wurde verschoben.</p>
    <Link to="/">Zur Startseite</Link>
  </section>
)
