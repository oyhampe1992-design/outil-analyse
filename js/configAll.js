/* ================================================================
   THE WOODER - configAll.js
   ================================================================
   Elague le JSON et redirige vers calcul.html avec ?photo=.
   Inclut le choix plinthe utilisateur dans ensemble.plinthe pour
   que les archetypes l'utilisent.
   Depend de : state.js, upload.js (lirePlinthe)
   ================================================================ */

function configAll() {
  if (!R || !R.elements || R.elements.length === 0) {
    alert('Rien a envoyer. Analysez d\'abord une photo.');
    return;
  }

  // Lit le choix de plinthe defini au debut par l'utilisateur
  var plinthe = lirePlinthe();

  var photoJson = {
    ensemble: {
      materiau_apparent:  (R.ensemble && R.ensemble.materiau_apparent)  || '',
      particularites:     (R.ensemble && R.ensemble.particularites)     || [],
      dimensions_totales: (R.ensemble && R.ensemble.dimensions_totales) || {},
      plinthe: plinthe   // { type: 'aucune'|'encastree'|'applique', hauteur: 0-500 }
    },
    elements: R.elements.map(function(el) {
      return {
        id:         el.id,
        type:       el.type,
        largeur:    el.largeur,
        hauteur:    el.hauteur,
        profondeur: el.profondeur,
        facade: {
          type:       el.facade && el.facade.type,
          nb_portes:  (el.facade && el.facade.nb_portes)  || 0,
          nb_tiroirs: (el.facade && el.facade.nb_tiroirs) || 0,
          pose:       (el.facade && el.facade.pose)       || 'applique'
        },
        sous_elements: {
          MI:   (el.sous_elements && el.sous_elements.MI)   || 0,
          PB:   (el.sous_elements && el.sous_elements.PB)   || 0,
          PC:   (el.sous_elements && el.sous_elements.PC)   || 0,
          TIR:  (el.sous_elements && el.sous_elements.TIR)  || 0,
          ETG:  (el.sous_elements && el.sous_elements.ETG)  || 0,
          PEND: (el.sous_elements && el.sous_elements.PEND) || 0,
          PLI:  plinthe.type   // hérité du choix global
        }
      };
    })
  };

  var jsonStr = JSON.stringify(photoJson);
  var b64 = btoa(unescape(encodeURIComponent(jsonStr)))
              .replace(/\+/g, '-')
              .replace(/\//g, '_');
  var urlFinale = URL_CALCUL + '?photo=' + b64;

  if (urlFinale.length > 7000) {
    alert('Photo trop complexe pour etre envoyee par URL (' + urlFinale.length + ' caracteres).');
    return;
  }

  window.open(urlFinale, '_blank');
}
