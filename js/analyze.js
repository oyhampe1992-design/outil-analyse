/* ================================================================
   THE WOODER - analyze.js
   ================================================================
   Appel a l'API /api/analyze, parsing du JSON de reponse.
   Depend de : state.js, prompt.js, render.js
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
    TW = (R.ensemble && R.ensemble.dimensions_totales)
         ? R.ensemble.dimensions_totales.largeur : 0;
    renderAll();
  })
  .catch(function(err) {
    hide('ldx'); show('abr');
    showErr(err.message);
  });
}

// Parse tolerant : retire les backticks, cherche le premier { et dernier }
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
