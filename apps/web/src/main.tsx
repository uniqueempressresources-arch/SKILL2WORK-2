import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const apiUrl =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const ARTISAN_MARKER = '[SKILL2WORK_ARTISAN_PROFILE]';

type Session = {
  user: {
    id: string;
    name: string;
    email: string;
  };
} | null;

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

type ArtisanProfile = {
  trade: string;
  otherTrade: string;
  services: string;
  serviceArea: string;
  availability: string;
  pricing: string;
  experience: string;
  portfolio: string;
};

const emptyArtisan: ArtisanProfile = {
  trade: '',
  otherTrade: '',
  services: '',
  serviceArea: '',
  availability: 'Full-time',
  pricing: '',
  experience: '',
  portfolio: '',
};

async function api(
  path: string,
  options: RequestInit = {},
) {
  return fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
}

function parseArtisan(bio: string): ArtisanProfile | null {
  const markerIndex = bio.indexOf(ARTISAN_MARKER);

  if (markerIndex < 0) return null;

  try {
    const json = bio
      .slice(markerIndex + ARTISAN_MARKER.length)
      .trim();

    return {
      ...emptyArtisan,
      ...JSON.parse(json),
    };
  } catch {
    return null;
  }
}

function visibleBio(bio: string): string {
  const markerIndex = bio.indexOf(ARTISAN_MARKER);

  return markerIndex < 0
    ? bio
    : bio.slice(0, markerIndex).trim();
}

function withArtisanData(
  bio: string,
  artisan: ArtisanProfile | null,
): string {
  const cleanBio = visibleBio(bio);

  if (!artisan) return cleanBio;

  return `${cleanBio}${cleanBio ? '\n\n' : ''}${ARTISAN_MARKER}\n${JSON.stringify(artisan)}`;
}

function App() {
  const [apiStatus, setApiStatus] = React.useState<
    'checking' | 'online' | 'offline'
  >('checking');

  const [session, setSession] = React.useState<Session>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);

  const [authMode, setAuthMode] = React.useState<
    'signup' | 'signin'
  >('signup');

  const [authMessage, setAuthMessage] = React.useState('');
  const [authBusy, setAuthBusy] = React.useState(false);

  const [question, setQuestion] = React.useState(
    'What jobs fit my skills?',
  );
  const [answer, setAnswer] = React.useState('');

  const [showArtisanForm, setShowArtisanForm] =
    React.useState(false);

  const [artisan, setArtisan] =
    React.useState<ArtisanProfile>(emptyArtisan);

  const [artisanBusy, setArtisanBusy] = React.useState(false);
  const [artisanMessage, setArtisanMessage] = React.useState('');

  React.useEffect(() => {
    api('/health')
      .then(response =>
        setApiStatus(response.ok ? 'online' : 'offline'),
      )
      .catch(() => setApiStatus('offline'));

    void loadSession();
  }, []);

  async function loadSession() {
    try {
      const response = await api('/api/me');

      if (!response.ok) {
        setSession(null);
        return;
      }

      const data = await response.json();
      setSession(data);

      await loadProfile();
    } catch {
      setSession(null);
    }
  }

  async function loadProfile() {
    setProfileLoading(true);

    try {
      const response = await api('/api/profile');

      if (!response.ok) {
        setProfile(null);
        return;
      }

      const data = await response.json();
      const loadedProfile: Profile | null = data.profile ?? null;

      setProfile(loadedProfile);

      const savedArtisan = loadedProfile
        ? parseArtisan(loadedProfile.bio ?? '')
        : null;

      setArtisan(savedArtisan ?? emptyArtisan);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  async function submitAuth(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const name = String(form.get('name') ?? '');

    const endpoint =
      authMode === 'signup'
        ? '/api/auth/sign-up/email'
        : '/api/auth/sign-in/email';

    const body =
      authMode === 'signup'
        ? { name, email, password }
        : { email, password };

    try {
      const response = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ??
            data.error ??
            'Authentication failed.',
        );
      }

      setAuthMessage(
        authMode === 'signup'
          ? 'Account created. Welcome to Skill2Work!'
          : 'Signed in successfully.',
      );

      await loadSession();
    } catch (error) {
      setAuthMessage(
        error instanceof Error
          ? error.message
          : 'Authentication failed.',
      );
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    try {
      await api('/api/auth/sign-out', {
        method: 'POST',
        body: '{}',
      });
    } finally {
      setSession(null);
      setProfile(null);
      setShowArtisanForm(false);
      setAuthMessage('You are signed out.');
    }
  }

  async function saveProfile(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const skills = String(form.get('skills') ?? '')
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);

    const payload = {
      fullName: String(form.get('fullName') ?? ''),
      userType: String(form.get('userType') ?? 'job_seeker'),
      headline: String(form.get('headline') ?? ''),
      bio: withArtisanData(
        String(form.get('bio') ?? ''),
        parseArtisan(profile?.bio ?? ''),
      ),
      location: String(form.get('location') ?? ''),
      skills,
    };

    try {
      const response = await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAuthMessage(
          data.error ?? data.message ?? 'Could not save profile.',
        );
        return;
      }

      setProfile(data.profile);
      setAuthMessage('Profile saved successfully.');
    } catch {
      setAuthMessage(
        'Could not reach the API. Please try again.',
      );
    }
  }

  function openArtisanProfile() {
    setAuthMessage('');

    if (!session) {
      setAuthMode('signup');
      setAuthMessage(
        'Create an account or sign in to build your artisan profile.',
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    setArtisan(
      parseArtisan(profile?.bio ?? '') ?? emptyArtisan,
    );
    setArtisanMessage('');
    setShowArtisanForm(true);

    window.setTimeout(() => {
      document
        .getElementById('artisan-form')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 100);
  }

  async function saveArtisanProfile(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!session) {
      setArtisanMessage('Please sign in first.');
      return;
    }

    setArtisanBusy(true);
    setArtisanMessage('');

    const form = new FormData(event.currentTarget);

    const details: ArtisanProfile = {
      trade: String(form.get('trade') ?? ''),
      otherTrade: String(form.get('otherTrade') ?? ''),
      services: String(form.get('services') ?? ''),
      serviceArea: String(form.get('serviceArea') ?? ''),
      availability: String(form.get('availability') ?? ''),
      pricing: String(form.get('pricing') ?? ''),
      experience: String(form.get('experience') ?? ''),
      portfolio: String(form.get('portfolio') ?? ''),
    };

    const tradeName =
      details.trade === 'Other'
        ? details.otherTrade
        : details.trade;

    if (!tradeName.trim()) {
      setArtisanMessage('Please select or enter your trade.');
      setArtisanBusy(false);
      return;
    }

    const existingBio = visibleBio(profile?.bio ?? '');

    const profileSkills = [
      tradeName,
      ...details.services
        .split(',')
        .map(value => value.trim())
        .filter(Boolean),
    ];

    const artisanSummary = [
      `Trade: ${tradeName}`,
      `Services: ${details.services}`,
      `Service area: ${details.serviceArea}`,
      `Availability: ${details.availability}`,
      `Pricing: ${details.pricing || 'To be discussed'}`,
      `Experience: ${details.experience || 'Not specified'}`,
      `Portfolio: ${details.portfolio || 'Not provided'}`,
    ].join('\n');

    const payload = {
      fullName: profile?.full_name ?? session.user.name,
      userType: 'artisan',
      headline: `${tradeName} / Skilled Trade Professional`,
      bio: withArtisanData(
        existingBio || artisanSummary,
        details,
      ),
      location: details.serviceArea,
      skills: profileSkills,
    };

    try {
      const response = await api('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setArtisanMessage(
          data.error ??
            data.message ??
            'Could not save your artisan profile.',
        );
        return;
      }

      setProfile(data.profile);
      setArtisan(details);
      setArtisanMessage(
        'Your artisan profile has been saved successfully.',
      );
    } catch {
      setArtisanMessage(
        'Could not reach the API. Please try again.',
      );
    } finally {
      setArtisanBusy(false);
    }
  }

  async function askCoach() {
    setAnswer('Preparing practical guidance…');

    try {
      const response = await api('/api/ai/respond', {
        method: 'POST',
        body: JSON.stringify({
          feature: 'career_coach',
          input: question,
        }),
      });

      const data = await response.json().catch(() => ({}));

      setAnswer(
        data.text ?? 'AI is unavailable right now.',
      );
    } catch {
      setAnswer(
        'The API is unavailable. Your core Skill2Work workflow should remain usable without AI.',
      );
    }
  }

  const currentArtisan = profile
    ? parseArtisan(profile.bio ?? '')
    : null;

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="mark">S</span>
          <span>Skill2Work</span>
        </div>

        <span className={`status ${apiStatus}`}>
          API: {apiStatus} ·{' '}
          {session
            ? `signed in as ${session.user.email}`
            : 'guest'}
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">
          DISCOVER → DEVELOP → PROVE → MATCH → EARN
        </p>
        <h1>Know your skills. Find your next opportunity.</h1>
        <p>
          One platform for careers, jobs, gigs, clients and
          practical income pathways — including artisans and
          skilled-trade professionals.
        </p>
      </section>

      {!session ? (
        <section className="card auth-card">
          <div className="tabs">
            <button
              type="button"
              className={
                authMode === 'signup' ? 'tab active' : 'tab'
              }
              onClick={() => setAuthMode('signup')}
            >
              Create account
            </button>

            <button
              type="button"
              className={
                authMode === 'signin' ? 'tab active' : 'tab'
              }
              onClick={() => setAuthMode('signin')}
            >
              Sign in
            </button>
          </div>

          <form onSubmit={submitAuth} className="form">
            {authMode === 'signup' && (
              <label>
                Full name
                <input
                  name="name"
                  required
                  minLength={2}
                  placeholder="Your name"
                />
              </label>
            )}

            <label>
              Email
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </label>

            <button type="submit" disabled={authBusy}>
              {authBusy
                ? 'Please wait…'
                : authMode === 'signup'
                  ? 'Create my Skill2Work account'
                  : 'Sign in'}
            </button>
          </form>

          {authMessage && (
            <p className="notice" role="status">
              {authMessage}
            </p>
          )}
        </section>
      ) : (
        <section className="card profile-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MY PROFILE</p>
              <h2>
                {profile
                  ? 'Your Skill2Work profile'
                  : 'Create your Skill2Work profile'}
              </h2>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>

          <form
            onSubmit={saveProfile}
            className="form profile-form"
          >
            <label>
              Full name
              <input
                name="fullName"
                required
                defaultValue={
                  profile?.full_name ?? session.user.name
                }
              />
            </label>

            <label>
              User type
              <select
                name="userType"
                defaultValue={profile?.user_type ?? 'job_seeker'}
              >
                <option value="job_seeker">Job seeker</option>
                <option value="student">Student</option>
                <option value="career_changer">
                  Career changer
                </option>
                <option value="freelancer">Freelancer</option>
                <option value="artisan">
                  Artisan / skilled trade
                </option>
                <option value="employer">Employer</option>
              </select>
            </label>

            <label>
              Professional headline
              <input
                name="headline"
                defaultValue={profile?.headline ?? ''}
                placeholder="e.g. French Tutor & Recruitment Specialist"
              />
            </label>

            <label>
              Location
              <input
                name="location"
                defaultValue={profile?.location ?? ''}
                placeholder="e.g. Lagos, Nigeria"
              />
            </label>

            <label>
              Skills <small>comma-separated</small>
              <input
                name="skills"
                defaultValue={profile?.skills?.join(', ') ?? ''}
                placeholder="Communication, Teaching, Sales"
              />
            </label>

            <label>
              About you
              <textarea
                name="bio"
                defaultValue={visibleBio(profile?.bio ?? '')}
                placeholder="Tell Skill2Work what you do and what opportunity you want next."
              />
            </label>

            <button type="submit" disabled={profileLoading}>
              {profileLoading ? 'Loading…' : 'Save profile'}
            </button>
          </form>

          {profile && (
            <p className="success">
              ✓ Profile retrieved from the Skill2Work API.
              {profile.updated_at
                ? ` Last updated ${new Date(
                    profile.updated_at,
                  ).toLocaleString()}.`
                : ''}
            </p>
          )}

          {authMessage && (
            <p className="notice" role="status">
              {authMessage}
            </p>
          )}
        </section>
      )}

      {showArtisanForm && session && (
        <section
          id="artisan-form"
          className="card profile-card"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">ARTISAN PROFILE</p>
              <h2>Create your trade profile</h2>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={() => setShowArtisanForm(false)}
            >
              Close
            </button>
          </div>

          <p>
            Describe your trade and services so your profile can
            represent the work you offer.
          </p>

          <form
            className="form profile-form"
            onSubmit={saveArtisanProfile}
          >
            <label>
              Trade
              <select
                name="trade"
                value={artisan.trade}
                onChange={event =>
                  setArtisan({
                    ...artisan,
                    trade: event.target.value,
                  })
                }
                required
              >
                <option value="">Select your trade</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Welder">Welder / Fabricator</option>
                <option value="Painter">Painter</option>
                <option value="Mechanic">Mechanic</option>
                <option value="Tailor">Tailor / Fashion Designer</option>
                <option value="Hairdresser">Hairdresser / Barber</option>
                <option value="Caterer">Caterer</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Technician">Technician</option>
                <option value="Builder">Builder / Mason</option>
                <option value="Other">Other trade</option>
              </select>
            </label>

            {artisan.trade === 'Other' && (
              <label>
                Enter your trade
                <input
                  name="otherTrade"
                  value={artisan.otherTrade}
                  onChange={event =>
                    setArtisan({
                      ...artisan,
                      otherTrade: event.target.value,
                    })
                  }
                  required
                  placeholder="Your trade or profession"
                />
              </label>
            )}

            <label>
              Services you offer
              <textarea
                name="services"
                value={artisan.services}
                onChange={event =>
                  setArtisan({
                    ...artisan,
                    services: event.target.value,
                  })
                }
                required
                placeholder="e.g. Wiring, repairs, installations"
              />
            </label>

            <label>
              Service area
              <input
                name="serviceArea"
                value={artisan.serviceArea}
                onChange={event =>
                  setArtisan({
                    ...artisan,
                    serviceArea: event.target.value,
                  })
                }
                required
                placeholder="e.g. Ibadan, Oyo State"
              />
            </label>

            <label>
              Availability
              <select
                name="availability"
                value={artisan.availability}
                onChange={event =>
                  setArtisan({
                    ...artisan,
                    availability: event.target.value,
                  })
                }
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Weekends">Weekends</option>
                <option value="Flexible">Flexible</option>
                <option value="By appointment">By appointment</option>
              </select>
            </label>

            <label>
              Indicative pricing (optional)
              <input
                name="pricing"
                value={artisan.pricing}
                onChange={event =>
                  setArtisan({
                    ...artisan,
                    pricing: event.target.value,
                  })
                }
                placeholder="e.g. From ₦10,000 per job"
              />
            </label>

            <label>
              Years of experience (optional)
              <input
                name="experience"
                value={artisan.experience}
                onChange={event =>
                  setArtisan({
                    ...artisan,
                    experience: event.target.value,
                  })
                }
                placeholder="e.g. 5 years"
              />
            </label>

            <label>
              Portfolio or work samples link (optional)
              <input
                name="portfolio"
                type="url"
                value={artisan.portfolio}
                onChange={event =>
                  setArtisan({
                    ...artisan,
                    portfolio: event.target.value,
                  })
                }
                placeholder="https://..."
              />
            </label>

            <button type="submit" disabled={artisanBusy}>
              {artisanBusy
                ? 'Saving artisan profile…'
                : 'Save Artisan Profile'}
            </button>
          </form>

          {artisanMessage && (
            <p
              className="notice"
              role="status"
              aria-live="polite"
            >
              {artisanMessage}
            </p>
          )}

          {currentArtisan && (
            <p className="success">
              An artisan profile is already saved for this account.
            </p>
          )}
        </section>
      )}

      <section className="grid">
        <article className="card">
          <h2>Skills DNA</h2>
          <Skill name="Teaching" value={91} />
          <Skill name="Communication" value={88} />
          <Skill name="Organisation" value={84} />
          <Skill name="Digital Skills" value={63} />
        </article>

        <article className="card">
          <h2>Matched opportunities</h2>
          <Opportunity
            title="Customer Support Specialist"
            score={87}
            verified
          />
          <Opportunity
            title="Online French Tutor"
            score={84}
            verified
          />
          <Opportunity
            title="Electrical Maintenance Technician"
            score={89}
            service
          />
        </article>
      </section>

      <section className="card artisan">
        <div>
          <p className="eyebrow">
            ARTISAN & SKILLED TRADE HUB
          </p>
          <h2>Turn practical skill into opportunity.</h2>
          <p>
            Create a trade profile, describe your services, set
            your service area and show the work you offer.
          </p>
        </div>

        <button
          type="button"
          onClick={openArtisanProfile}
        >
          Create Artisan Profile
        </button>
      </section>

      <section id="coach" className="card coach">
        <p className="eyebrow">OPTIONAL AI — SERVER SIDE</p>
        <h2>AI Career Coach</h2>

        <label htmlFor="question">
          Your career question
        </label>

        <textarea
          id="question"
          value={question}
          onChange={event =>
            setQuestion(event.target.value)
          }
        />

        <button type="button" onClick={askCoach}>
          Get practical guidance
        </button>

        {answer && (
          <div className="answer" role="status">
            {answer}
          </div>
        )}
      </section>

      <footer>
        Skill2Work online deployment foundation · AI optional
      </footer>
    </main>
  );
}

function Skill({
  name,
  value,
}: {
  name: string;
  value: number;
}) {
  return (
    <div className="skill">
      <div>
        <span>{name}</span>
        <strong>{value}%</strong>
      </div>
      <div className="bar">
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Opportunity({
  title,
  score,
  verified,
  service,
}: {
  title: string;
  score: number;
  verified?: boolean;
  service?: boolean;
}) {
  return (
    <div className="opportunity">
      <div>
        <strong>{title}</strong>
        <span>
          {service
            ? 'Service Request'
            : verified
              ? 'Verified'
              : 'Opportunity'}
        </span>
      </div>
      <b>{score}%</b>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);