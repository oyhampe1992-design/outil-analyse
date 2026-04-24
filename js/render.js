/* ================================================================
   THE WOODER - render.js
   ================================================================
   Affichage des resultats et des cartes d'element avec edition
   complete (dimensions, portes, tiroirs, montants, etageres, penderie).
   Depend de : state.js, edit.js
   ================================================================ */

var LABELS_TYPE = {
  COL: 'Colonne',
  CB:  'Caisson bas',
  CH:  'Caisson haut',
  NO:  'Niche ouverte',
  DC:  'Demi-colonne'
};

var TYPES_FACADE = ['portes_battantes', 'porte_coulissante', 'tiroirs', 'mixte', 'ouvert', 'vitree', 'aucune'];

function renderAll() {
  show('rx'); hide('uz'); hide('abr'); hide('ldx');
  g('ri').src = imgSrc;

  var e = R.ensemble || {};
  g('en').textContent = (M === 'client') ? (e.nom_client || '') : (e.nom_technique || '');
  g('em').textContent = [e.style, e.materiau_apparent].filter(Boolean).join(' - ');
  g('tw').value = TW;
  g('th').textContent = ((e.dimensions_totales && e.dimensions_totales.hauteur) || '?') + ' cm';
  g('tp').textContent = ((e.dimensions_totales && e.dimensions_totales.profondeur) || '?') + ' cm';

  var els = R.elements || [];
  g('stt').textContent = els.length;
  g('stl').textContent = 'elements';
  g('lt').textContent = (M === 'client') ? 'Vos meubles' : 'Elements de fabrication';
  g('cab').textContent = (M === 'client') ? 'Demander un devis' : 'Configurer tout';

  renderEls();
}

function renderEls() {
  var L = g('el');
  L.innerHTML = '';
  var els = R.elements || [];

  for (var i = 0; i < els.length; i++) {
    L.appendChild(carteElement(els[i], i, els.length));
  }
}

// ── Carte d'un element avec tous les champs editables ───────────
function carteElement(el, i, total) {
  var se = el.sous_elements || {};
  var fa = el.facade || {};
  var d = document.createElement('div');
  d.className = 'ec';

  d.innerHTML =
    '<div class="ee">' +
      // Ligne 1 : nom + deplacer + supprimer
      '<div class="er1">' +
        '<button class="elb" ' + (i === 0 ? 'disabled' : '') + ' onclick="mvEl(' + i + ',-1)">◀</button>' +
        '<button class="elb" ' + (i === total - 1 ? 'disabled' : '') + ' onclick="mvEl(' + i + ',1)">▶</button>' +
        '<input type="text" value="' + escAttr(el.nom_client || '') + '" onchange="setChamp(' + i + ',\'nom_client\',this.value)">' +
        '<button class="elb" onclick="dupEl(' + i + ')" title="Dupliquer">⎘</button>' +
        '<button class="elb dl" onclick="dlEl(' + i + ')" title="Supprimer">✕</button>' +
      '</div>' +
      // Ligne 2 : type + dimensions
      '<div class="er1">' +
        '<select onchange="setChamp(' + i + ',\'type\',this.value)" style="font-size:10px">' +
          optType(el.type) +
        '</select>' +
        '<span class="lbl">L</span><input type="number" value="' + (el.largeur || 0) + '" onchange="setChamp(' + i + ',\'largeur\',+this.value)">' +
        '<span class="lbl">H</span><input type="number" value="' + (el.hauteur || 0) + '" onchange="setChamp(' + i + ',\'hauteur\',+this.value)">' +
        '<span class="lbl">P</span><input type="number" value="' + (el.profondeur || 0) + '" onchange="setChamp(' + i + ',\'profondeur\',+this.value)">' +
      '</div>' +
    '</div>' +
    '<div class="eb">' +
      // Titre
      '<div style="font-family:DM Mono,monospace;font-size:11px;color:#2D5A3D;font-weight:600;margin-bottom:8px">' +
        (el.id || ('E' + (i + 1))) + ' - ' + (LABELS_TYPE[el.type] || el.type) +
      '</div>' +

      // Structure (MI)
      '<div class="bl"><div class="blti">Structure</div>' +
        plusMoins('Montants interm.', i, 'MI',  se.MI  || 0) +
      '</div>' +

      // Facade
      '<div class="bl"><div class="blti">Facade</div>' +
        '<div class="blli">Type : ' +
          '<select onchange="setFac(' + i + ',\'type\',this.value)" style="font-size:11px">' +
            optFacade(fa.type) +
          '</select>' +
          ' &nbsp; Pose : ' +
          '<select onchange="setFac(' + i + ',\'pose\',this.value)" style="font-size:11px">' +
            '<option value="applique" '  + (fa.pose === 'applique'  ? 'selected' : '') + '>applique</option>' +
            '<option value="encastree" ' + (fa.pose === 'encastree' ? 'selected' : '') + '>encastree</option>' +
          '</select>' +
        '</div>' +
        plusMoins('Portes battantes', i, 'PB',  se.PB  || fa.nb_portes  || 0) +
        plusMoins('Tiroirs',          i, 'TIR', se.TIR || fa.nb_tiroirs || 0) +
      '</div>' +

      // Interieur
      '<div class="bl"><div class="blti">Interieur</div>' +
        plusMoins('Etageres', i, 'ETG',  se.ETG  || 0) +
        plusMoins('Penderie', i, 'PEND', se.PEND || 0) +
      '</div>' +
    '</div>';

  return d;
}

// ── Petits helpers visuels ───────────────────────────────────────

function plusMoins(label, i, key, valeur) {
  return '<div class="blli">' + label + ' : ' +
    '<button class="elb" onclick="incSE(' + i + ',\'' + key + '\',-1)">−</button>' +
    '<span class="valInt">' + valeur + '</span>' +
    '<button class="elb" onclick="incSE(' + i + ',\'' + key + '\',1)">+</button>' +
  '</div>';
}

function optType(current) {
  var types = ['CB', 'CH', 'COL', 'NO', 'DC'];
  var out = '';
  for (var i = 0; i < types.length; i++) {
    out += '<option value="' + types[i] + '" ' + (current === types[i] ? 'selected' : '') + '>' + LABELS_TYPE[types[i]] + '</option>';
  }
  return out;
}

function optFacade(current) {
  var out = '';
  for (var i = 0; i < TYPES_FACADE.length; i++) {
    var t = TYPES_FACADE[i];
    out += '<option value="' + t + '" ' + (current === t ? 'selected' : '') + '>' + t.replace(/_/g, ' ') + '</option>';
  }
  return out;
}

function escAttr(s) {
  return ('' + s).replace(/"/g, '&quot;');
}

function resizeAll() {
  var nw = +g('tw').value;
  if (!TW || !nw) return;
  var r = nw / TW;
  R.elements.forEach(function(e) { e.largeur = Math.round((e.largeur || 60) * r); });
  TW = nw;
  if (R.ensemble && R.ensemble.dimensions_totales) {
    R.ensemble.dimensions_totales.largeur = nw;
  }
  renderAll();
}
