/* ================================================================
   THE WOODER - edit.js
   ================================================================
   Fonctions d'edition des elements detectes :
   - Modifier un champ (dimensions, nom, type)
   - Ajouter/retirer portes, tiroirs, montants, etageres, penderie
   - Dupliquer un element (utile pour colonnes identiques)
   - Supprimer un element
   - Deplacer (gauche/droite)
   - Ajouter un element manquant non detecte
   Depend de : state.js, render.js
   ================================================================ */

// ── Modifier un champ du meuble (nom, type, dimensions) ─────────
function setChamp(i, champ, val) {
  if (!R.elements[i]) return;
  R.elements[i][champ] = val;
  // Si on change le type, on met a jour l'affichage
  if (champ === 'type') renderAll();
}

// ── Modifier un champ de la facade (type, pose) ─────────────────
function setFac(i, champ, val) {
  if (!R.elements[i]) return;
  if (!R.elements[i].facade) R.elements[i].facade = {};
  R.elements[i].facade[champ] = val;
}

// ── Incrementer/decrementer un sous-element (+1 ou -1) ──────────
// key : 'MI', 'PB', 'PC', 'TIR', 'ETG', 'PEND'
function incSE(i, key, delta) {
  if (!R.elements[i]) return;
  if (!R.elements[i].sous_elements) R.elements[i].sous_elements = {};
  var cur = R.elements[i].sous_elements[key] || 0;
  var nouveau = Math.max(0, cur + delta);
  R.elements[i].sous_elements[key] = nouveau;

  // Synchroniser facade.nb_portes et nb_tiroirs pour coherence
  if (key === 'PB') {
    if (!R.elements[i].facade) R.elements[i].facade = {};
    R.elements[i].facade.nb_portes = nouveau;
  }
  if (key === 'TIR') {
    if (!R.elements[i].facade) R.elements[i].facade = {};
    R.elements[i].facade.nb_tiroirs = nouveau;
  }

  renderAll();
}

// ── Supprimer un element ─────────────────────────────────────────
function dlEl(i) {
  if (!confirm('Supprimer cet element ?')) return;
  R.elements.splice(i, 1);
  renderAll();
}

// ── Dupliquer un element (utile pour colonnes identiques) ───────
function dupEl(i) {
  if (!R.elements[i]) return;
  var copie = JSON.parse(JSON.stringify(R.elements[i]));
  copie.id = (copie.type || 'E') + '_' + (R.elements.length + 1);
  R.elements.splice(i + 1, 0, copie);
  renderAll();
}

// ── Deplacer un element a gauche (-1) ou a droite (+1) ──────────
function mvEl(i, d) {
  var e = R.elements;
  var n = i + d;
  if (n < 0 || n >= e.length) return;
  var tmp = e[i];
  e[i] = e[n];
  e[n] = tmp;
  renderAll();
}

// ── Ajouter un element manquant (bouton + Caisson bas, etc.) ────
function addEl(t) {
  var op = (t === 'NO');   // niche ouverte : pas de portes
  var nouveau = {
    id:               t + '_' + (R.elements.length + 1),
    nom_client:       'Nouveau ' + (t || ''),
    nom_technique:    'Nouveau ' + (t || ''),
    type:             t,
    zone_horizontale: 'centre',
    largeur:          60,
    hauteur:          (t === 'COL') ? 220 : (op ? 40 : 80),
    profondeur:       40,
    facade: {
      type:        op ? 'ouvert' : 'portes_battantes',
      nb_portes:   op ? 0 : 2,
      nb_tiroirs:  0,
      pose:        'applique'
    },
    sous_elements: {
      MI:   0,
      PB:   op ? 0 : 2,
      PC:   0,
      TIR:  0,
      ETG:  op ? 3 : 0,
      PEND: 0,
      PLI:  'applique'
    }
  };
  R.elements.push(nouveau);
  renderAll();
}
