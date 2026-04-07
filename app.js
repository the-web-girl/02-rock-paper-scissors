
    /* ── Data ─────────────────────────────────────── */
    const CHOICES = {
      pierre:  { emoji: '✊', label: 'Pierre',  beats: 'ciseaux' },
      feuille: { emoji: '✋', label: 'Feuille', beats: 'pierre'  },
      ciseaux: { emoji: '✌️', label: 'Ciseaux', beats: 'feuille' },
    };
    const KEYS = { p: 'pierre', f: 'feuille', c: 'ciseaux' };
    const DETAILS = {
      pierre:  { ciseaux: 'La pierre écrase les ciseaux.' },
      feuille: { pierre:  'La feuille enveloppe la pierre.' },
      ciseaux: { feuille: 'Les ciseaux coupent la feuille.' },
    };

    /* ── State ────────────────────────────────────── */
    let score = { player: 0, draws: 0, cpu: 0 };

    /* ── DOM refs ─────────────────────────────────── */
    const arena        = document.getElementById('arena');
    const placeholder  = document.getElementById('arena-placeholder');
    const liveRegion   = document.getElementById('live');
    const scoreEls     = {
      player: document.getElementById('score-player'),
      draws:  document.getElementById('score-draws'),
      cpu:    document.getElementById('score-cpu'),
    };

    /* ── Helpers ──────────────────────────────────── */
    function randomChoice() {
      const keys = Object.keys(CHOICES);
      return keys[Math.floor(Math.random() * keys.length)];
    }

    function announce(msg) {
      liveRegion.textContent = '';
      requestAnimationFrame(() => { liveRegion.textContent = msg; });
    }

    function bumpScore(key) {
      const el = scoreEls[key];
      el.classList.remove('bump');
      void el.offsetWidth; // reflow
      el.classList.add('bump');
      el.addEventListener('animationend', () => el.classList.remove('bump'), { once: true });
    }

    function updateScoreboard() {
      Object.entries(scoreEls).forEach(([k, el]) => {
        el.textContent = score[k];
      });
    }

    /* ── Game logic ───────────────────────────────── */
    function play(playerChoice) {
      const cpuChoice = randomChoice();
      const p = CHOICES[playerChoice];
      const c = CHOICES[cpuChoice];

      let outcome, label, detail;

      if (playerChoice === cpuChoice) {
        outcome = 'draw';
        label   = 'Égalité !';
        detail  = 'Vous avez joué le même coup.';
        score.draws++;
        bumpScore('draws');
      } else if (p.beats === cpuChoice) {
        outcome = 'win';
        label   = 'Vous gagnez !';
        detail  = DETAILS[playerChoice][cpuChoice];
        score.player++;
        bumpScore('player');
      } else {
        outcome = 'lose';
        label   = "L'ordi gagne !";
        detail  = DETAILS[cpuChoice][playerChoice];
        score.cpu++;
        bumpScore('cpu');
      }

      updateScoreboard();
      renderArena(p, c, outcome, label, detail);

      // Announce for screen readers
      announce(
        `Vous : ${p.label}. Ordinateur : ${c.label}. ${label} ${detail} ` +
        `Score — Vous : ${score.player}, Nuls : ${score.draws}, Ordinateur : ${score.cpu}.`
      );
    }

    /* ── Render ───────────────────────────────────── */
    function renderArena(player, cpu, outcome, label, detail) {
      placeholder && placeholder.remove();

      arena.innerHTML = `
        <div class="versus" aria-hidden="true">
          <div class="versus-side">
            <span class="versus-tag">Vous</span>
            <span class="versus-emoji">${player.emoji}</span>
          </div>
          <span class="versus-sep">VS</span>
          <div class="versus-side">
            <span class="versus-tag">Ordi</span>
            <span class="versus-emoji">${cpu.emoji}</span>
          </div>
        </div>
        <span class="result-badge ${outcome}">${label}</span>
        <p class="result-detail">${detail}</p>
      `;
    }

    /* ── Events ───────────────────────────────────── */
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => play(btn.dataset.choice));
    });

    document.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
      if (KEYS[key]) {
        e.preventDefault();
        play(KEYS[key]);
        // Visually highlight the pressed button
        const btn = document.querySelector(`[data-choice="${KEYS[key]}"]`);
        if (btn) { btn.focus(); }
      }
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      score = { player: 0, draws: 0, cpu: 0 };
      updateScoreboard();
      arena.innerHTML = '<p class="arena-placeholder" id="arena-placeholder">Choisissez un coup pour commencer !</p>';
      announce('Score remis à zéro. Bonne partie !');
    });