#!/usr/bin/env node
/**
 * run-dev — launcher unico per l'ambiente di sviluppo di Pizza Theory.
 *
 * Uso:
 *   npm run run-dev -- --web
 *   npm run run-dev -- --android
 *   npm run run-dev -- --ios
 *   ./scripts/run-dev.js --android --clear
 *
 * Regole:
 *  - --web      avvia il bundler Metro per il browser (expo start --web).
 *  - --android  avvia SOLO se `adb devices` riporta un dispositivo fisico
 *               collegato e autorizzato. NON avvia mai un emulatore.
 *  - --ios      avvia SOLO se `xcrun xctrace list devices` riporta un iPhone/iPad
 *               fisico collegato. NON avvia mai il simulatore.
 *
 * Qualsiasi altro argomento viene inoltrato tal quale a `expo start`
 * (es. --clear, --tunnel, --port 8082).
 */

const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

// ─── Output helpers ─────────────────────────────────────────────────────────
const C = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  dim: '\u001b[2m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  cyan: '\u001b[36m',
};
const log = (msg = '') => console.log(msg);
const info = (msg) => log(`${C.cyan}▸${C.reset} ${msg}`);
const ok = (msg) => log(`${C.green}✔${C.reset} ${msg}`);
const warn = (msg) => log(`${C.yellow}!${C.reset} ${msg}`);
const fail = (msg) => console.error(`${C.red}✖ ${msg}${C.reset}`);

function usage() {
  log(`
${C.bold}🍕 Pizza Theory — run-dev${C.reset}

${C.bold}Uso${C.reset}
  npm run run-dev -- <piattaforma> [opzioni expo]
  ./scripts/run-dev.js <piattaforma> [opzioni expo]

${C.bold}Piattaforme${C.reset} (obbligatorio sceglierne una)
  --web        Avvia l'app nel browser su http://localhost:8081
  --android    Avvia su dispositivo Android ${C.dim}fisico${C.reset} collegato via USB/Wi-Fi debugging
  --ios        Avvia su iPhone/iPad ${C.dim}fisico${C.reset} collegato via USB

${C.bold}Opzioni${C.reset}
  -h, --help   Mostra questo messaggio

${C.dim}Ogni altro argomento viene inoltrato a "expo start"
(es. --clear per svuotare la cache di Metro, --port 8082, --tunnel).${C.reset}

${C.bold}Nota${C.reset}
  Gli emulatori/simulatori non vengono MAI avviati automaticamente.
  Se non trova un dispositivo fisico collegato, il comando si ferma con errore.
`);
}

// ─── Argument parsing ───────────────────────────────────────────────────────
const argv = process.argv.slice(2);

if (argv.length === 0 || argv.includes('-h') || argv.includes('--help')) {
  usage();
  process.exit(argv.length === 0 ? 1 : 0);
}

const PLATFORM_FLAGS = ['--web', '--android', '--ios'];
const selected = PLATFORM_FLAGS.filter((f) => argv.includes(f));
const passthrough = argv.filter((a) => !PLATFORM_FLAGS.includes(a));

if (selected.length === 0) {
  fail('Nessuna piattaforma selezionata.');
  log(`  Usa una tra: ${PLATFORM_FLAGS.join(', ')}  —  "run-dev --help" per i dettagli.`);
  process.exit(1);
}
if (selected.length > 1) {
  fail(`Seleziona una sola piattaforma per volta (ricevute: ${selected.join(', ')}).`);
  process.exit(1);
}

const platform = selected[0].replace('--', '');

// ─── Device detection ───────────────────────────────────────────────────────

/** @returns {{ok: true, devices: {id: string, label: string}[]} | {ok: false, reason: string}} */
function detectAndroidDevices() {
  const probe = spawnSync('adb', ['devices', '-l'], { encoding: 'utf8' });

  if (probe.error) {
    return {
      ok: false,
      reason:
        'comando "adb" non trovato. Installa gli Android Platform Tools e aggiungili al PATH\n' +
        '    (es. export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools").',
    };
  }
  if (probe.status !== 0) {
    return { ok: false, reason: `"adb devices" è uscito con codice ${probe.status}.` };
  }

  const lines = String(probe.stdout).split('\n').slice(1);
  const devices = [];
  const unauthorized = [];
  const offline = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const [id, state] = line.split(/\s+/);
    if (!id || !state) continue;
    // Esclude gli emulatori: devono essere avviati a mano, non da questo script.
    if (id.startsWith('emulator-')) continue;

    if (state === 'device') {
      const model = /model:(\S+)/.exec(line)?.[1]?.replace(/_/g, ' ');
      devices.push({ id, label: model ? `${model} (${id})` : id });
    } else if (state === 'unauthorized') {
      unauthorized.push(id);
    } else if (state === 'offline') {
      offline.push(id);
    }
  }

  if (devices.length > 0) return { ok: true, devices };

  if (unauthorized.length > 0) {
    return {
      ok: false,
      reason:
        `dispositivo ${unauthorized[0]} collegato ma NON autorizzato.\n` +
        '    Sblocca il telefono e accetta il popup "Consenti debug USB".',
    };
  }
  if (offline.length > 0) {
    return { ok: false, reason: `dispositivo ${offline[0]} in stato "offline". Scollega e ricollega il cavo USB.` };
  }
  return {
    ok: false,
    reason:
      'nessun dispositivo Android fisico collegato.\n' +
      '    1. Collega il telefono via USB\n' +
      '    2. Abilita Opzioni sviluppatore → Debug USB\n' +
      '    3. Accetta il popup di autorizzazione sul telefono\n' +
      '    4. Verifica con: adb devices',
  };
}

/** @returns {{ok: true, devices: {id: string, label: string}[]} | {ok: false, reason: string}} */
function detectIosDevices() {
  const probe = spawnSync('xcrun', ['xctrace', 'list', 'devices'], { encoding: 'utf8' });

  if (probe.error || probe.status !== 0) {
    return {
      ok: false,
      reason:
        'impossibile interrogare i dispositivi iOS tramite "xcrun xctrace".\n' +
        '    Verifica che Xcode e i Command Line Tools siano installati (xcode-select --install).',
    };
  }

  const out = String(probe.stdout);
  const devices = [];
  const offline = [];
  let section = null;

  for (const raw of out.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('==')) {
      if (/Devices Offline/i.test(line)) section = 'offline';
      else if (/Simulators/i.test(line)) section = 'simulators';
      else if (/Devices/i.test(line)) section = 'devices';
      else section = null;
      continue;
    }
    if (section !== 'devices' && section !== 'offline') continue;

    // Un device fisico ha DUE gruppi fra parentesi: "Nome (18.5) (00008110-000E...)".
    // Il Mac che ospita Xcode ne ha uno solo: "MacBook Air (4ADE68F4-...)".
    const match = /^(.*?)\s+\(([\d.]+)\)\s+\(([0-9A-Fa-f-]+)\)$/.exec(line);
    if (!match) continue;

    const entry = { id: match[3], label: `${match[1]} — iOS ${match[2]}` };
    if (section === 'devices') devices.push(entry);
    else offline.push(entry);
  }

  if (devices.length > 0) return { ok: true, devices };

  if (offline.length > 0) {
    return {
      ok: false,
      reason:
        `"${offline[0].label}" risulta associato ma NON collegato.\n` +
        '    Collega l\'iPhone via cavo, sbloccalo e conferma "Autorizza questo computer".',
    };
  }
  return {
    ok: false,
    reason:
      'nessun iPhone/iPad fisico collegato.\n' +
      '    1. Collega il dispositivo via cavo USB\n' +
      '    2. Sbloccalo e tocca "Autorizza" / "Fidati di questo computer"\n' +
      '    3. Verifica con: xcrun xctrace list devices',
  };
}

// ─── Launcher ───────────────────────────────────────────────────────────────
function startExpo(args, env = {}) {
  const child = spawn('npx', ['expo', 'start', ...args, ...passthrough], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });

  child.on('error', (err) => {
    fail(`Impossibile avviare Expo: ${err.message}`);
    process.exit(1);
  });
  child.on('exit', (code, signal) => {
    process.exit(signal ? 1 : (code ?? 0));
  });

  // Inoltra Ctrl-C / kill al processo figlio.
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => child.kill(sig));
  }
}

log(`\n${C.bold}🍕 Pizza Theory${C.reset} ${C.dim}— run-dev (${platform})${C.reset}\n`);

if (platform === 'web') {
  info('Avvio del bundler Metro per il browser…');
  log(`  ${C.dim}L'app sarà disponibile su http://localhost:8081${C.reset}\n`);
  startExpo(['--web']);
} else if (platform === 'android') {
  info('Ricerca di dispositivi Android fisici collegati…');
  const res = detectAndroidDevices();

  if (!res.ok) {
    fail(`Android: ${res.reason}`);
    log(`\n  ${C.dim}L'emulatore non viene avviato automaticamente: se vuoi usarlo, avvialo da`);
    log(`  Android Studio e poi lancia "npx expo start --android".${C.reset}\n`);
    process.exit(1);
  }

  if (res.devices.length > 1) {
    warn(`Trovati ${res.devices.length} dispositivi: uso il primo.`);
    res.devices.forEach((d, i) => log(`    ${i === 0 ? '→' : ' '} ${d.label}`));
  }
  const device = res.devices[0];
  ok(`Dispositivo trovato: ${C.bold}${device.label}${C.reset}`);
  info('Avvio dell\'app su dispositivo fisico (nessun emulatore)…\n');

  // ANDROID_SERIAL vincola adb al dispositivo scelto, anche con più device collegati.
  startExpo(['--android'], { ANDROID_SERIAL: device.id });
} else {
  info('Ricerca di dispositivi iOS fisici collegati…');
  const res = detectIosDevices();

  if (!res.ok) {
    fail(`iOS: ${res.reason}`);
    log(`\n  ${C.dim}Il simulatore non viene avviato automaticamente: se vuoi usarlo, lancia`);
    log(`  "npx expo start --ios".${C.reset}\n`);
    process.exit(1);
  }

  if (res.devices.length > 1) {
    warn(`Trovati ${res.devices.length} dispositivi: uso il primo.`);
    res.devices.forEach((d, i) => log(`    ${i === 0 ? '→' : ' '} ${d.label}`));
  }
  const device = res.devices[0];
  ok(`Dispositivo trovato: ${C.bold}${device.label}${C.reset}`);

  const hasNativeProject = fs.existsSync(path.join(ROOT, 'ios'));

  if (hasNativeProject) {
    // Development build: si installa e si avvia direttamente sul device.
    info('Progetto nativo iOS rilevato → build di sviluppo sul dispositivo…\n');
    const child = spawn('npx', ['expo', 'run:ios', '--device', device.id, ...passthrough], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    child.on('error', (err) => {
      fail(`Impossibile avviare la build iOS: ${err.message}`);
      process.exit(1);
    });
    child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
    for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
  } else {
    // Managed workflow (nessuna cartella ios/): su device fisico si passa da Expo Go.
    info('Workflow managed (nessuna cartella ios/) → avvio del dev server per Expo Go.');
    log(`  ${C.dim}Apri Expo Go su "${device.label}" e inquadra il QR code qui sotto,`);
    log(`  oppure premi "s" per inviare il link. Il simulatore NON verrà avviato.${C.reset}\n`);
    startExpo([]);
  }
}
