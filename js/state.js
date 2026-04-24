/* ================================================================
   THE WOODER - state.js
   ================================================================
   Variables globales et helpers partages entre tous les modules.
   DOIT etre charge en PREMIER dans index.html.
   ================================================================ */

var M = 'client';              // mode d'affichage : 'client' ou 'menuisier'
var imgSrc = null;             // data URL de l'image pour preview
var imgB64 = null;             // base64 de l'image (envoyee a l'API)
var imgMime = null;            // type mime de l'image
var R = null;                  // resultat d'analyse (objet {ensemble, elements})
var TW = 0;                    // largeur totale du projet (pour resize proportionnel)

var URL_CALCUL = 'https://oyhampe1992-design.github.io/plateforme2026/calcul.html';

// ── Helpers DOM ─────────────────────────────────────────────────
function g(id)    { return document.getElementById(id); }
function show(id) { g(id).classList.remove('dn'); }
function hide(id) { g(id).classList.add('dn'); }

function showErr(m) { g('erx').textContent = 'Erreur: ' + m; show('erx'); hide('ldx'); }
function showDbg(m) { g('dbx').textContent = m; show('dbx'); }

// ── Mode client / menuisier ─────────────────────────────────────
function setMode(m, b) {
  M = m;
  document.querySelectorAll('.mb').forEach(function(x) { x.classList.remove('a'); });
  b.classList.add('a');
  g('sub').textContent = (m === 'client')
    ? 'Reproduisez un meuble a partir d\'une photo'
    : 'Analyse technique - decomposition fabrication';
  if (R) renderAll();
}
