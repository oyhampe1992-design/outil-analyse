/* ================================================================
   THE WOODER - analyze.js (v3)
   ================================================================
   CHANGELOG v3 :
   - Log le JSON brut de la composition pour chaque element
     (pour diagnostiquer les cas ou le mapper refuse)
   - Expose window.R pour acces console si besoin
   ================================================================ */

function analyze() {
  if (!imgB64) { showErr('Chargez une photo'); return; }

  var L = +g('dimL').value;
  var H = +g('dimH').value;
  var P = +g('dimP').value;
  if (!(L > 0 && H > 0 && P > 0)) {
    showErr('Renseigne les 3 dimensions avant analyse.');
    return;
  }

  show('ldx'); hide('erx'); hide('dbx'); hide('rx'); hide('abr'); hide('dimsForm');
  g('lmsg').textContent = 'Analyse en cours...';

  var prompt = construirePrompt(L, H, P);

  var body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: 'Tu es menuisier. Reponds UNIQUEMENT en JSON valide.',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: imgMime, data: imgB64 } },
        { type: 'text', text: prompt }
      ]
    }]
  };

  fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(function(resp) {
    return resp.text().then(function(raw) { return { ok: resp.ok, status: resp.status, raw: raw }; });
  })
  .then(function(r) {
    if (!r.ok) { showDbg('HTTP ' + r.status); throw new Error('HTTP ' + r.status); }
    var json = JSON.parse(r.raw);
    if (json.error) throw new Error(json.error.message || 'Erreur API');

    var txt = '';
    if (json.content) {
      for (var i = 0; i < json.content.length; i++) {
        if (json.content[i].type === 'text') txt += json.content[i].text;
      }
    }

    var parsed = tryParseJson(txt);
    if (!parsed) {
      var m = txt.match(/\{[\s\S]*"ensemble"[\s\S]*"elements"[\s\S]*\}/);
      if (m) parsed = tryParseJson(m[0]);
    }
    if (!parsed) throw new Error('JSON non trouve dans la reponse');

    hide('dbx');
    R = parsed;
    window.R = parsed;
    TW = (R.ensemble && R.ensemble.dimensions_totales)
         ? R.ensemble.dimensions_totales.largeur : 0;

    // ─── Log analyse formatee ─────────────────────────────────────
    console.log('═══════════════════════════════════════════════════');
    console.log('[analyze] ANALYSE TERMINEE - ' + (R.elements || []).length + ' elements');
    console.log('═══════════════════════════════════════════════════');
    (R.elements || []).forEach(function(el, idx) {
      var compo = el.facade && el.facade.composition;
      console.log('--- Element ' + (idx + 1) + ' : ' + (el.id || '') + ' (' + el.type + ') ---');
      console.log('  PB=' + ((el.sous_elements && el.sous_elements.PB) || 0) +
                  ' TIR=' + ((el.sous_elements && el.sous_elements.TIR) || 0) +
                  ' ETG=' + ((el.sous_elements && el.sous_elements.ETG) || 0) +
                  ' MI=' + ((el.sous_elements && el.sous_elements.MI) || 0));
      if (compo && compo.length > 0) {
        console.log('  Composition (' + compo.length + ' ligne' + (compo.length > 1 ? 's' : '') + ') :');
        compo.forEach(function(ligne) {
          var elems = (ligne.elements || []).map(function(e) { return e.type; }).join(' + ');
          console.log('    L' + ligne.ligne + ' (' + (ligne.hauteur_ratio != null ? (ligne.hauteur_ratio * 100).toFixed(0) + '%' : 'ratio null') + ') : ' + elems);
        });
      } else {
        console.log('  PAS DE COMPOSITION produite par l\'IA');
      }
    });
    console.log('═══════════════════════════════════════════════════');

    // ─── Log brut JSON pour diagnostic ───────────────────────────
    console.log('[DEBUG] JSON brut des facades :');
    (R.elements || []).forEach(function(el, idx) {
      console.log('Element ' + (idx + 1) + ' facade :', JSON.stringify(el.facade));
    });
    console.log('[DEBUG] JSON brut complet de R :');
    console.log(JSON.stringify(R, null, 2));

    renderAll();
  })
  .catch(function(err) {
    hide('ldx'); show('abr');
    showErr(err.message);
  });
}

function tryParseJson(s) {
  if (!s) return null;
  try {
    var c = s.replace(/```json/g, '').replace(/```/g, '').trim();
    var i = c.indexOf('{'), j = c.lastIndexOf('}');
    if (i < 0 || j < 0) return null;
    var o = JSON.parse(c.substring(i, j + 1));
    return (o && o.ensemble) ? o : null;
  } catch (e) {
    return null;
  }
}
