/* ============================================================
   CLAUSIFY — Authentication
   js/auth.js
   Supabase email + Google OAuth, modal, session state
   ============================================================ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/* ── SUPABASE CLIENT ──────────────────────────────────────── */

const SUPABASE_URL = 'https://yybwlxmkvktouehhefyu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WN1CoMdDjzu2ntGN3K851Q_ffBfh1m6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


/* ── MODAL STATE ──────────────────────────────────────────── */

let activeTab = 'signin'; // 'signin' | 'signup'

export function openAuthModal(defaultTab = 'signin') {
  activeTab = defaultTab;
  renderModal();
  document.getElementById('auth-modal-overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

export function closeAuthModal() {
  document.getElementById('auth-modal-overlay').classList.remove('show');
  document.body.style.overflow = '';
  clearErrors();
}

function switchTab(tab) {
  activeTab = tab;
  clearErrors();

  document.querySelectorAll('.auth-tab').forEach(t =>
    t.classList.toggle('on', t.dataset.tab === tab)
  );
  document.getElementById('auth-signin-form').style.display = tab === 'signin' ? 'block' : 'none';
  document.getElementById('auth-signup-form').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('auth-modal-subtitle').textContent =
    tab === 'signin' ? 'Sign in to your account' : 'Create your free account';
}


/* ── MODAL HTML ───────────────────────────────────────────── */

function renderModal() {
  // Only inject once
  if (document.getElementById('auth-modal-overlay')) {
    switchTab(activeTab);
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'auth-modal-overlay';
  overlay.innerHTML = `
    <div class="auth-modal" role="dialog" aria-modal="true" aria-label="Sign in">

      <button class="auth-close" onclick="window.__clausify_auth.close()" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div class="auth-logo">Claus<em>ify</em></div>
      <p class="auth-modal-subtitle" id="auth-modal-subtitle">Sign in to your account</p>

      <div class="auth-tabs">
        <button class="auth-tab on" data-tab="signin" onclick="window.__clausify_auth.switchTab('signin')">Sign in</button>
        <button class="auth-tab"    data-tab="signup" onclick="window.__clausify_auth.switchTab('signup')">Create account</button>
      </div>

      <!-- SIGN IN FORM -->
      <div id="auth-signin-form">
        <div class="auth-field">
          <label>Email address</label>
          <input type="email" id="si-email" placeholder="you@example.com" autocomplete="email">
        </div>
        <div class="auth-field">
          <label>Password</label>
          <input type="password" id="si-pass" placeholder="Enter your password" autocomplete="current-password">
          <div class="auth-error" id="si-error"></div>
        </div>
        <div class="auth-forgot" onclick="handleForgotPassword()">Forgot password?</div>
        <button class="auth-btn-primary" onclick="window.__clausify_auth.signIn()">Sign in</button>
        <div class="auth-or"><div class="auth-or-line"></div><span>or</span><div class="auth-or-line"></div></div>
        <button class="auth-btn-google" onclick="window.__clausify_auth.signInWithGoogle()">
          ${googleIcon()}
          Continue with Google
        </button>
        <p class="auth-switch">Don't have an account? <a onclick="window.__clausify_auth.switchTab('signup')">Sign up</a></p>
      </div>

      <!-- SIGN UP FORM -->
      <div id="auth-signup-form" style="display:none">
        <div class="auth-name-row">
          <div class="auth-field">
            <label>First name</label>
            <input type="text" id="su-first" placeholder="Priya" autocomplete="given-name">
          </div>
          <div class="auth-field">
            <label>Last name</label>
            <input type="text" id="su-last" placeholder="Sharma" autocomplete="family-name">
          </div>
        </div>
        <div class="auth-field">
          <label>Email address</label>
          <input type="email" id="su-email" placeholder="you@example.com" autocomplete="email">
        </div>
        <div class="auth-field">
          <label>Phone number</label>
          <div class="auth-phone-row">
            <span class="auth-phone-prefix">+91</span>
            <input type="tel" id="su-phone" placeholder="98765 43210" maxlength="10" autocomplete="tel">
          </div>
        </div>
        <div class="auth-field">
          <label>Password</label>
          <input type="password" id="su-pass" placeholder="At least 8 characters" autocomplete="new-password">
          <div class="auth-error" id="su-error"></div>
        </div>
        <button class="auth-btn-primary" onclick="window.__clausify_auth.signUp()">Create account</button>
        <div class="auth-or"><div class="auth-or-line"></div><span>or</span><div class="auth-or-line"></div></div>
        <button class="auth-btn-google" onclick="window.__clausify_auth.signInWithGoogle()">
          ${googleIcon()}
          Continue with Google
        </button>
        <p class="auth-switch">Already have an account? <a onclick="window.__clausify_auth.switchTab('signin')">Sign in</a></p>
      </div>

    </div>
  `;

  // Close on backdrop click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeAuthModal();
  });

  document.body.appendChild(overlay);
  switchTab(activeTab);

  // Focus first input
  setTimeout(() => {
    const first = overlay.querySelector('input');
    if (first) first.focus();
  }, 100);
}

function googleIcon() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>`;
}


/* ── AUTH ACTIONS ─────────────────────────────────────────── */

async function signIn() {
  const email    = document.getElementById('si-email').value.trim();
  const password = document.getElementById('si-pass').value;

  if (!email || !password) {
    showError('si-error', 'Please enter your email and password.');
    return;
  }

  setLoading('si', true);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  setLoading('si', false);

  if (error) {
    showError('si-error', friendlyError(error.message));
  } else {
    closeAuthModal();
  }
}

async function signUp() {
  const first    = document.getElementById('su-first').value.trim();
  const last     = document.getElementById('su-last').value.trim();
  const email    = document.getElementById('su-email').value.trim();
  const phone    = document.getElementById('su-phone').value.trim();
  const password = document.getElementById('su-pass').value;

  if (!first || !last || !email || !phone) {
    showError('su-error', 'Please fill in all fields.');
    return;
  }
  if (password.length < 8) {
    showError('su-error', 'Password must be at least 8 characters.');
    return;
  }

  setLoading('su', true);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${first} ${last}`,
        first_name: first,
        last_name: last,
        phone,
      }
    }
  });

  setLoading('su', false);

  if (error) {
    showError('su-error', friendlyError(error.message));
  } else {
    showConfirmationScreen(email);
  }
}

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
}

async function handleForgotPassword() {
  const email = document.getElementById('si-email').value.trim();
  if (!email) {
    showError('si-error', 'Enter your email address above first.');
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '?reset=true'
  });
  if (error) {
    showError('si-error', friendlyError(error.message));
  } else {
    showError('si-error', '✓ Reset link sent — check your inbox.', 'success');
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}


/* ── EMAIL CONFIRMATION SCREEN ────────────────────────────── */

function showConfirmationScreen(email) {
  const form = document.getElementById('auth-signup-form');
  form.innerHTML = `
    <div class="auth-confirm">
      <div class="auth-confirm-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold2)" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </div>
      <h3>Check your inbox</h3>
      <p>We sent a confirmation link to <strong>${email}</strong>. Click the link to activate your account.</p>
      <button class="auth-btn-primary" style="margin-top:18px" onclick="window.__clausify_auth.switchToSignin()">Back to sign in</button>
    </div>
  `;
}

function switchToSignin() {
  // Re-render signup form then switch tab
  closeAuthModal();
  setTimeout(() => openAuthModal('signin'), 50);
}


/* ── SESSION & NAV STATE ──────────────────────────────────── */

export function initAuth() {
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    updateNavState(session?.user ?? null);
  });

  // Check existing session on load
  supabase.auth.getSession().then(({ data: { session } }) => {
    updateNavState(session?.user ?? null);
  });
}

function updateNavState(user) {
  const signinBtn = document.getElementById('nav-signin-btn');
  const ctaBtn    = document.getElementById('nav-cta-btn');
  const userMenu  = document.getElementById('nav-user-menu');

  if (!signinBtn) return;

  if (user) {
    // Logged in state
    const name      = user.user_metadata?.first_name || user.email.split('@')[0];
    const initial   = name.charAt(0).toUpperCase();
    signinBtn.style.display = 'none';
    ctaBtn.style.display    = 'none';
    if (userMenu) {
      userMenu.style.display = 'flex';
      userMenu.innerHTML = `
        <div class="nav-avatar" onclick="toggleUserDropdown()">${initial}</div>
        <div class="nav-user-dropdown" id="user-dropdown">
          <div class="dropdown-name">${name}</div>
          <div class="dropdown-email">${user.email}</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" onclick="window.__clausify_auth.signOut()">Sign out</div>
        </div>
      `;
    }
  } else {
    // Logged out state
    signinBtn.style.display = '';
    ctaBtn.style.display    = '';
    if (userMenu) userMenu.style.display = 'none';
  }
}

function toggleUserDropdown() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.toggle('open');
}

// Close dropdown on outside click
document.addEventListener('click', e => {
  const menu = document.getElementById('nav-user-menu');
  if (menu && !menu.contains(e.target)) {
    const dd = document.getElementById('user-dropdown');
    if (dd) dd.classList.remove('open');
  }
});


/* ── HELPERS ──────────────────────────────────────────────── */

function showError(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className   = 'auth-error show' + (type === 'success' ? ' success' : '');
}

function clearErrors() {
  document.querySelectorAll('.auth-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('show', 'success');
  });
}

function setLoading(prefix, isLoading) {
  const btn = document.querySelector(`#auth-${prefix === 'si' ? 'signin' : 'signup'}-form .auth-btn-primary`);
  if (!btn) return;
  btn.disabled     = isLoading;
  btn.textContent  = isLoading ? 'Please wait...' : (prefix === 'si' ? 'Sign in' : 'Create account');
}

function friendlyError(msg) {
  if (msg.includes('Invalid login'))         return 'Incorrect email or password. Please try again.';
  if (msg.includes('Email not confirmed'))   return 'Please confirm your email before signing in.';
  if (msg.includes('already registered'))    return 'An account with this email already exists. Sign in instead.';
  if (msg.includes('Password should be'))    return 'Password must be at least 8 characters.';
  if (msg.includes('Unable to validate'))    return 'Invalid email address.';
  return msg;
}


/* ── EXPOSE TO WINDOW (for onclick handlers) ──────────────── */

window.__clausify_auth = {
  open:           openAuthModal,
  close:          closeAuthModal,
  switchTab,
  switchToSignin,
  signIn,
  signUp,
  signInWithGoogle,
  signOut,
};