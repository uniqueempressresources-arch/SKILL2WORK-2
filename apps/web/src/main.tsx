import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type Session = { user: { id: string; name: string; email: string } } | null;
type Profile = {
  user_id: string;
  full_name: string;
  user_type: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  created_at: string;
  updated_at: string;
};

async function api(path: string, options: RequestInit = {}) {
  return fetch(`${apiUrl}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) } });
}

function App() {
  const [apiStatus, setApiStatus] = React.useState<'checking' | 'online' | 'offline'>('checking');
  const [session, setSession] = React.useState<Session>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'signup' | 'signin'>('signup');
  const [authMessage, setAuthMessage] = React.useState('');
  const [authBusy, setAuthBusy] = React.useState(false);
  const [question, setQuestion] = React.useState('What jobs fit my skills?');
  const [answer, setAnswer] = React.useState('');

  React.useEffect(() => {
    api('/health').then(r => setApiStatus(r.ok ? 'online' : 'offline')).catch(() => setApiStatus('offline'));
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const response = await api('/api/me');
      if (!response.ok) return;
      const data = await response.json();
      setSession(data);
      await loadProfile();
    } catch { /* guest */ }
  }

  async function loadProfile() {
    setProfileLoading(true);
    try {
      const response = await api('/api/profile');
      if (response.ok) setProfile((await response.json()).profile);
      else setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true); setAuthMessage('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const name = String(form.get('name') ?? '');
    const endpoint = authMode === 'signup' ? '/api/auth/sign-up/email' : '/api/auth/sign-in/email';
    const body = authMode === 'signup' ? { name, email, password } : { email, password };
    try {
      const response = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? data.error ?? 'Authentication failed.');
      setAuthMessage(authMode === 'signup' ? 'Account created. Welcome to Skill2Work!' : 'Signed in successfully.');
      await loadSession();
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally { setAuthBusy(false); }
  }

  async function signOut() {
    await api('/api/auth/sign-out', { method: 'POST', body: '{}' });
    setSession(null); setProfile(null); setAuthMessage('You are signed out.');
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const skills = String(form.get('skills') ?? '').split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      fullName: String(form.get('fullName') ?? ''),
      userType: String(form.get('userType') ?? 'job_seeker'),
      headline: String(form.get('headline') ?? ''),
      bio: String(form.get('bio') ?? ''),
      location: String(form.get('location') ?? ''),
      skills,
    };
    const response = await api('/api/profile', { method: 'PUT', body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) return setAuthMessage(data.error ?? 'Could not save profile.');
    setProfile(data.profile);
    setAuthMessage('Profile saved to PostgreSQL.');
  }

  async function askCoach() {
    setAnswer('Thinking through your profile and next practical step…');
    try {
      const response = await api('/api/ai/respond', { method: 'POST', body: JSON.stringify({ feature: 'career_coach', input: question }) });
      const data = await response.json();
      setAnswer(data.text ?? 'AI is unavailable right now.');
    } catch { setAnswer('The API is offline. Your core Skill2Work workflow should remain usable without AI.'); }
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><span className="mark">S</span><span>Skill2Work</span></div>
      <span className={`status ${apiStatus}`}>API: {apiStatus} · {session ? `signed in as ${session.user.email}` : 'guest'}</span>
    </header>

    <section className="hero">
      <p className="eyebrow">DISCOVER → DEVELOP → PROVE → MATCH → EARN</p>
      <h1>Know your skills. Find your next opportunity.</h1>
      <p>One platform for careers, jobs, gigs, clients and practical income pathways — including artisans and skilled-trade professionals.</p>
    </section>

    {!session ? <section className="card auth-card">
      <div className="tabs"><button className={authMode === 'signup' ? 'tab active' : 'tab'} onClick={() => setAuthMode('signup')}>Create account</button><button className={authMode === 'signin' ? 'tab active' : 'tab'} onClick={() => setAuthMode('signin')}>Sign in</button></div>
      <form onSubmit={submitAuth} className="form">
        {authMode === 'signup' && <label>Full name<input name="name" required minLength={2} placeholder="Your name" /></label>}
        <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
        <label>Password<input name="password" type="password" required minLength={8} placeholder="At least 8 characters" /></label>
        <button disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'signup' ? 'Create my Skill2Work account' : 'Sign in'}</button>
      </form>
      {authMessage && <p className="notice">{authMessage}</p>}
    </section> : <>
      <section className="card profile-card">
        <div className="section-heading"><div><p className="eyebrow">MY PROFILE</p><h2>{profile ? 'Your Skill2Work profile' : 'Create your Skill2Work profile'}</h2></div><button className="secondary" onClick={signOut}>Sign out</button></div>
        <form onSubmit={saveProfile} className="form profile-form">
          <label>Full name<input name="fullName" required defaultValue={profile?.full_name ?? session.user.name} /></label>
          <label>User type<select name="userType" defaultValue={profile?.user_type ?? 'job_seeker'}><option value="job_seeker">Job seeker</option><option value="student">Student</option><option value="career_changer">Career changer</option><option value="freelancer">Freelancer</option><option value="artisan">Artisan / skilled trade</option><option value="employer">Employer</option></select></label>
          <label>Professional headline<input name="headline" defaultValue={profile?.headline ?? ''} placeholder="e.g. French Tutor & Recruitment Specialist" /></label>
          <label>Location<input name="location" defaultValue={profile?.location ?? ''} placeholder="e.g. Lagos, Nigeria" /></label>
          <label>Skills <small>comma-separated</small><input name="skills" defaultValue={profile?.skills?.join(', ') ?? ''} placeholder="Communication, Teaching, Sales" /></label>
          <label>About you<textarea name="bio" defaultValue={profile?.bio ?? ''} placeholder="Tell Skill2Work what you do and what opportunity you want next." /></label>
          <button disabled={profileLoading}>{profileLoading ? 'Loading…' : 'Save profile'}</button>
        </form>
        {profile && <p className="success">✓ Retrieved from the Skill2Work API · last updated {new Date(profile.updated_at).toLocaleString()}</p>}
        {authMessage && <p className="notice">{authMessage}</p>}
      </section>
    </>}

    <section className="grid">
      <article className="card"><h2>Skills DNA</h2><Skill name="Teaching" value={91}/><Skill name="Communication" value={88}/><Skill name="Organisation" value={84}/><Skill name="Digital Skills" value={63}/></article>
      <article className="card"><h2>Matched opportunities</h2><Opportunity title="Customer Support Specialist" score={87} verified/><Opportunity title="Online French Tutor" score={84} verified/><Opportunity title="Electrical Maintenance Technician" score={89} service/></article>
    </section>

    <section className="card artisan">
  <div>
    <p className="eyebrow">ARTISAN & SKILLED TRADE HUB</p>
    <h2>Turn practical skill into opportunity.</h2>
    <p>
      Create a trade profile, show your work, set your service area
      and match with jobs, gigs, clients and service requests.
    </p>
  </div>
  <button
    type="button"
    onClick={() =>
      document.querySelector('.profile-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  >
    Create Artisan Profile
  </button>
</section>

    <section id="coach" className="card coach"><p className="eyebrow">OPTIONAL AI — SERVER SIDE</p><h2>AI Career Coach</h2><label htmlFor="question">Your career question</label><textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} /><button onClick={askCoach}>Get practical guidance</button>{answer && <div className="answer">{answer}</div>}</section>
    <footer>Skill2Work online deployment foundation • secure by design • AI optional</footer>
  </main>;
}

function Skill({ name, value }: { name: string; value: number }) { return <div className="skill"><div><span>{name}</span><strong>{value}%</strong></div><div className="bar"><i style={{ width: `${value}%` }} /></div></div>; }
function Opportunity({ title, score, verified, service }: { title: string; score: number; verified?: boolean; service?: boolean }) { return <div className="opportunity"><div><strong>{title}</strong><span>{service ? 'Service Request' : verified ? 'Verified' : 'Opportunity'}</span></div><b>{score}%</b></div>; }

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
