/* ================================================================
   THE WOODER - upload.js
   ================================================================
   Gestion de l'upload photo, du formulaire dimensions + plinthe,
   et du reset.
   Depend de : state.js
   ================================================================ */

function pickFile(inp) {
  var f = inp.files[0];
  if (!f || !f.type.startsWith('image/')) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var cv = document.createElement('canvas');
      var mx = 800;
      var w = img.width, h = img.height;
      if (w > mx || h > mx) {
        if (w > h) { h = Math.round(h * mx / w); w = mx; }
        else       { w = Math.round(w * mx / h); h = mx; }
      }
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);

      var du = cv.toDataURL('image/jpeg', 0.7);
      imgSrc = du;
      imgB64 = du.split(',')[1];
      imgMime = 'image/jpeg';

      g('pv').src = du;
      show('pv'); hide('ph');
      g('uz').classList.remove('np');
      show('dimsForm'); show('abr');
      hide('rx');
      R = null;
      checkDims();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(f);
}

// ── Lit le choix de plinthe radio+hauteur ───────────────────────
function lirePlinthe() {
  var radios = document.querySelectorAll('input[name="plinthe"]');
  var type = 'encastree';
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) { type = radios[i].value; break; }
  }
  var h = +g('plH').value || 100;
  if (type === 'aucune') h = 0;
  return { type: type, hauteur: h };
}

// Active le bouton Analyser si toutes les dimensions sont renseignees.
// La plinthe est toujours valide (radios avec valeur par defaut).
function checkDims() {
  var L = +g('dimL').value;
  var H = +g('dimH').value;
  var P = +g('dimP').value;
  g('btnAnalyze').disabled = !(L > 0 && H > 0 && P > 0);
}

function resetAll() {
  imgSrc = null; imgB64 = null; R = null;
  hide('pv'); show('ph');
  g('uz').classList.add('np');
  g('uz').classList.remove('dn');
  hide('dimsForm'); hide('abr'); hide('rx'); hide('erx'); hide('dbx');
  g('fi').value = '';
  g('dimL').value = '';
  g('dimH').value = '';
  g('dimP').value = '';
  // Reset plinthe au defaut encastree 100
  var radios = document.querySelectorAll('input[name="plinthe"]');
  for (var i = 0; i < radios.length; i++) {
    radios[i].checked = (radios[i].value === 'encastree');
  }
  g('plH').value = 100;
  g('btnAnalyze').disabled = true;
}
