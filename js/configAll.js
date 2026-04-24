/* ================================================================
   THE WOODER - configAll.js (v2)
   ================================================================
   CHANGELOG v2 :
   - L'elagage du JSON avant envoi a calcul.html preserve maintenant
     le champ facade.composition (avec sous_colonnes), essentiel
     pour le mapper qui decide du routage archetype.
   ================================================================ */

function configAll() {
  if (!R || !R.elements || R.elements.length === 0) {
    showErr('Aucun element a configurer');
    return;
  }

  // ─── Construire un JSON elage pour raccourcir l'URL ──────────
  // On garde :
  //  - ensemble.dimensions_totales et ensemble.plinthe
  //  - elements[i] : id, type, largeur, hauteur, profondeur
  //                  sous_elements (tous les champs)
  //                  facade.type, nb_portes, nb_tiroirs, pose, composition
  var elage = {
    ensemble: {
      dimensions_totales: R.ensemble.dimensions_totales || {},
      plinthe: lirePlinthe()
    },
    elements: R.elements.map(function(el) {
      var fac = el.facade || {};
      return {
        id:         el.id,
        type:       el.type,
        largeur:    el.largeur,
        hauteur:    el.hauteur,
        profondeur: el.profondeur,
        facade: {
          type:        fac.type,
          nb_portes:   fac.nb_portes,
          nb_tiroirs:  fac.nb_tiroirs,
          pose:        fac.pose,
          // IMPORTANT : on preserve la composition pour le mapper
          composition: fac.composition || []
        },
        sous_elements: el.sous_elements || {}
      };
    })
  };

  var jsonStr = JSON.stringify(elage);

  // Base64 URL-safe
  var b64 = btoa(unescape(encodeURIComponent(jsonStr)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  // Taille de l'URL
  var URL_CALCUL = 'https://oyhampe1992-design.github.io/plateforme2026/calcul.html';
  var urlComplete = URL_CALCUL + '?photo=' + b64;

  if (urlComplete.length > 7500) {
    showErr('URL trop longue (' + urlComplete.length + ' car). Il faut simplifier le JSON ou passer par localStorage.');
    console.error('[configAll] URL trop longue :', urlComplete.length);
    return;
  }

  console.log('[configAll] URL generee, longueur =', urlComplete.length);
  console.log('[configAll] JSON elage :', elage);
  window.open(urlComplete, '_blank');
}
