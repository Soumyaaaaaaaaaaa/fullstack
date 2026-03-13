/* ============================================================
   app.js — AI Job Hunt Automation Agent
   Vanilla JavaScript | No frameworks
   Features: Particles, Ripple, Tilt, Counters, Chart,
   Upload, Agent Flow, Gemini API, Typing Effect,
   Copy to Clipboard, Notifications, Timeline Reveal.
============================================================ */


/* ============================================================
   1. ANIMATED PARTICLE BACKGROUND
   Renders floating colored dots on <canvas id="bg-canvas">.
   Particles bounce off edges and run on requestAnimationFrame.
============================================================ */
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  /* Resize canvas to always fill the full viewport */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* Particle configuration */
  const COLORS    = ['#3b82f6', '#8b5cf6', '#22d3ee', '#f472b6'];
  const COUNT     = 55;
  const particles = [];

  /* Seed initial particles with random position, velocity, color */
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      r:  Math.random() * 1.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      c:  COLORS[Math.floor(Math.random() * COLORS.length)],
      o:  Math.random() * 0.5 + 0.1
    });
  }

  /* Main animation loop */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle   = p.c;
      ctx.globalAlpha = p.o;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
})();


/* ============================================================
   2. BUTTON RIPPLE EFFECT
   Listens for clicks on every .btn element and injects a
   circular ripple <span> that expands and fades out.
============================================================ */
(function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect   = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height);

      ripple.className = 'ripple';
      ripple.style.cssText = `
        width:  ${size}px;
        height: ${size}px;
        left:   ${e.clientX - rect.left - size / 2}px;
        top:    ${e.clientY - rect.top  - size / 2}px;
      `;

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
})();


/* ============================================================
   3. 3D PERSPECTIVE TILT EFFECT
   Tracks mouse position within each .tilt card and applies
   a subtle rotateX / rotateY perspective transform.
============================================================ */
(function initTilt() {
  document.querySelectorAll('.tilt').forEach(card => {

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = e.clientX - r.left - r.width  / 2;
      const y  = e.clientY - r.top  - r.height / 2;
      const rx =  (y / r.height) * 10;
      const ry = -(x / r.width)  * 10;

      card.style.transform = `
        translateY(-5px)
        scale(1.02)
        perspective(600px)
        rotateX(${rx}deg)
        rotateY(${ry}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ============================================================
   4. ANIMATED COUNTERS
   Counts each [data-target] element from 0 to target value
   using an ease-out-cubic easing curve.
   Triggered by the IntersectionObserver in section 5.
============================================================ */
function animateCounter(el, target, duration = 1800) {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);

    el.textContent = Math.floor(eased * target);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(step);
}


/* ============================================================
   5. INTERSECTION OBSERVER
   Watches key sections and fires counter + fill animations
   the moment they scroll into the viewport.
============================================================ */
(function initObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.querySelectorAll('.stat-bar-fill').forEach(fill => {
        setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 200);
      });

      entry.target.querySelectorAll('.progress-fill').forEach(fill => {
        setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 200);
      });

      document.querySelectorAll('[data-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target, 10));
      });

      document.querySelectorAll('.tl-item').forEach(item => {
        item.classList.add('visible');
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  const targets = ['.stats-section', '.progress-section', '.two-col'];
  targets.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) observer.observe(el);
  });
})();


/* ============================================================
   6. BAR CHART — WEEKLY PROGRESS
   Builds a grouped bar chart with plain DOM elements and
   animates bar heights in when the chart enters the viewport.
============================================================ */
(function buildChart() {
  const chart = document.getElementById('barChart');
  if (!chart) return;

  const weeks  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const apps   = [14, 22, 18, 30, 25, 10, 8];
  const out    = [20, 28, 22, 35, 30, 14, 10];
  const rep    = [5,  9,  7,  13, 10,  4,  3];
  const maxVal = Math.max(...out);

  weeks.forEach((label, i) => {
    const group = document.createElement('div');
    group.className = 'bar-group';

    [
      { h: apps[i], color: '#3b82f6', label: `Apps: ${apps[i]}`    },
      { h: out[i],  color: '#8b5cf6', label: `Outreach: ${out[i]}` },
      { h: rep[i],  color: '#34d399', label: `Replies: ${rep[i]}`  }
    ].forEach(d => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.cssText = `
        background: ${d.color};
        opacity:    0.75;
        max-height: ${(d.h / maxVal) * 120}px;
        width:      26%;
      `;
      bar.innerHTML = `<span class="bar-tooltip">${d.label}</span>`;
      group.appendChild(bar);
    });

    const lbl = document.createElement('div');
    lbl.className   = 'bar-label';
    lbl.textContent = label;
    group.appendChild(lbl);

    chart.appendChild(group);
  });

  const chartObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;

    chart.querySelectorAll('.bar').forEach((bar, i) => {
      const targetH = bar.style.maxHeight;
      bar.style.transition = `height ${0.6 + i * 0.04}s cubic-bezier(0.23, 1, 0.32, 1)`;
      setTimeout(() => { bar.style.height = targetH; }, 200 + i * 30);
    });

    chartObserver.disconnect();
  }, { threshold: 0.3 });

  chartObserver.observe(chart);
})();


/* ============================================================
   7. RESUME FILE UPLOAD HANDLER
   Updates the upload button label with the selected filename
   and shows a notification to confirm the file was loaded.
============================================================ */
(function initUpload() {
  const input = document.getElementById('resumeInput');
  if (!input) return;

  input.addEventListener('change', function () {
    const labelEl   = document.getElementById('uploadLabel');
    const indicator = document.getElementById('uploadIndicator');

    if (!this.files.length) return;

    const name = this.files[0].name;

    if (labelEl) {
      labelEl.textContent = name.length > 20
        ? name.substring(0, 20) + '…'
        : name;
    }

    if (indicator) indicator.classList.add('has-file');

    showNotification('📎 Resume Loaded', `${name} is ready for analysis.`);
  });
})();


/* ============================================================
   8. START AI AGENT — startAgent()
   Reads job role and target companies from the form inputs,
   shows the loading overlay with step-by-step progress,
   then calls generateOutreach() once initialisation is done.
============================================================ */
function startAgent() {
  const role      = (document.getElementById('jobRole')?.value.trim())   || 'Software Engineer';
  const companies = (document.getElementById('companies')?.value.trim()) || 'Google, Stripe, Vercel';
  const btn       = document.getElementById('startBtn');
  const overlay   = document.getElementById('loadingOverlay');
  const stepIds   = ['step1', 'step2', 'step3', 'step4', 'step5'];
  let   idx       = 0;

  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
  }
  if (overlay) overlay.classList.add('active');

  stepIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('done', 'active');
  });

  function nextStep() {
    if (idx > 0) {
      const prev = document.getElementById(stepIds[idx - 1]);
      if (prev) prev.classList.replace('active', 'done');
    }

    if (idx < stepIds.length) {
      const current = document.getElementById(stepIds[idx]);
      if (current) current.classList.add('active');
      idx++;
      setTimeout(nextStep, 780);
    } else {
      setTimeout(() => {
        if (overlay) overlay.classList.remove('active');
        if (btn) {
          btn.classList.remove('loading');
          btn.disabled = false;
        }

        generateOutreach(role, companies);

        showNotification('⚡ Agent Started', `Hunting ${role} roles at ${companies}.`);
        setTimeout(() => showNotification('📬 Outreach Queued', 'Messages sent to 3 recruiters.'), 2000);
        setTimeout(() => showNotification('🎤 Interview Alert', 'One company responded — scheduling call.'), 4500);
      }, 600);
    }
  }

  nextStep();
}


/* ============================================================
   9. GEMINI API INTEGRATION — generateOutreach(role, companies)
   Calls Gemini 2.5 Flash to generate:
     • 3 suggested employees to contact for referral
     • Their relevant job titles
     • A professional cold outreach email
   The response is rendered via the typing animation below.
============================================================ */
async function generateOutreach(role, companies) {
  const API_KEY   = "YOUR_GEMINI_API_KEY";
  const container = document.getElementById('outreachBody');
  if (!container) return;

  container.innerHTML = '<span class="placeholder-msg">✨ Contacting Gemini AI… generating your outreach…<span class="type-cursor"></span></span>';

  /* Prompt instructs Gemini to produce referral contacts + cold email */
  const userText = `
I am applying for a ${role} position at ${companies}.

Please help me with the following:

1. Suggest 3 specific employees I could contact for a referral at ${companies}.
   For each person provide:
   - A realistic full name
   - Their job title (relevant to ${role} hiring)
   - One sentence on why they are a good contact

2. Write a short, professional cold outreach email I can send to one of these contacts on LinkedIn or email.
   - Keep it under 150 words
   - Friendly but professional tone
   - Mention the ${role} role specifically
   - End with a clear call to action

Format your response clearly with headings for each section.
`.trim();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userText }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    /* Navigate the Gemini response structure to extract the text */
    const message = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!message) {
      throw new Error('Empty response received from Gemini API.');
    }

    /* Hand off to the typing animation */
    typeMessage(container, message);

  } catch (err) {
    console.error('Outreach generation failed:', err);
    container.innerHTML = '<span class="placeholder-msg">⚠️ Failed to generate outreach message. Please check your API key and try again.</span>';
  }
}


/* ============================================================
   10. TYPING ANIMATION — typeMessage(container, message)
   Displays text character-by-character with a blinking cursor.
   Newlines are converted to <br> so they render in HTML.
   Called internally by generateOutreach() after API success.
============================================================ */
function typeMessage(container, message) {
  container.innerHTML = '<span class="type-cursor"></span>';
  let i = 0;

  function type() {
    if (i < message.length) {
      const rendered = message
        .substring(0, i + 1)
        .replace(/\n/g, '<br/>');

      container.innerHTML = rendered + '<span class="type-cursor"></span>';
      i++;

      /* Slightly longer pause after newlines for natural pacing */
      const delay = 18 + (message[i - 1] === '\n' ? 60 : 0);
      setTimeout(type, delay);
    } else {
      /* Typing complete — remove cursor and show final clean text */
      container.innerHTML = message.replace(/\n/g, '<br/>');
    }
  }

  type();
}


/* ============================================================
   11. COPY TO CLIPBOARD — copyMessage()
   Copies the outreach message text to the clipboard and
   gives the copy button a brief visual confirmation.
============================================================ */
function copyMessage() {
  const container = document.getElementById('outreachBody');
  const copyBtn   = document.getElementById('copyBtn');
  if (!container) return;

  const text = container.innerText;

  /* Guard: skip if placeholder / loading / error text is showing */
  const skipPhrases = [
    'Start the AI agent',
    'Contacting Gemini',
    'Failed to generate',
    'generating your outreach'
  ];
  if (!text || skipPhrases.some(p => text.includes(p))) return;

  navigator.clipboard.writeText(text).then(() => {
    if (copyBtn) {
      copyBtn.innerHTML = '<span>✅</span> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<span>📋</span> Copy';
      }, 2000);
    }
    showNotification('📋 Copied!', 'Outreach message copied to clipboard.');
  }).catch(err => {
    console.error('Clipboard copy failed:', err);
    showNotification('⚠️ Copy Failed', 'Could not access clipboard. Try again.');
  });
}


/* ============================================================
   12. NOTIFICATION SYSTEM — showNotification(title, body, color)
   Creates a toast notification that slides in from the
   bottom-right corner and auto-dismisses after 4.5 seconds.

   @param {string} title  — Bold notification heading
   @param {string} body   — Supporting description text
   @param {string} color  — Optional left-border accent (hex/rgb)
============================================================ */
function showNotification(title, body, color = '#3b82f6') {
  const container = document.getElementById('notifContainer');
  if (!container) return;

  const el  = document.createElement('div');
  const now = new Date();

  el.className = 'notif';
  el.style.setProperty('--c', color);

  el.innerHTML = `
    <div class="notif-title">${title}</div>
    <div class="notif-body">${body}</div>
    <div class="notif-time">${now.toLocaleTimeString()}</div>
  `;

  container.appendChild(el);

  /*
   * Double rAF ensures the off-screen transform is painted before
   * .show is applied, so the slide-in transition always fires.
   */
  requestAnimationFrame(() =>
    requestAnimationFrame(() => el.classList.add('show'))
  );

  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 500);
  }, 4500);
}


/* ============================================================
   13. PAGE LOAD — WELCOME NOTIFICATIONS (Demo)
   Fires two demo notifications on page load to show the
   notification system is live.
============================================================ */
window.addEventListener('load', () => {
  setTimeout(() => showNotification('👋 Welcome Back', 'Your AI agent is standing by.', '#8b5cf6'), 1200);
  setTimeout(() => showNotification('📊 Report Ready', '147 applications tracked this month.', '#22d3ee'), 3500);
});


/* ============================================================
   14. TIMELINE FALLBACK REVEAL
   Guarantees timeline items become visible after 800 ms even
   if the IntersectionObserver fires before they are painted.
============================================================ */
setTimeout(() => {
  document.querySelectorAll('.tl-item').forEach(item => {
    item.classList.add('visible');
  });
}, 800);