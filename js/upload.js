/* ================================================================
   THE WOODER - upload.js
   ================================================================
   Gestion de l'upload photo, du formulaire dimensions, et du reset.
   Depend de : state.js
   ================================================================ */

function pickFile(inp) {
  var f = inp.files[0];
  if (!f || !f.type.startsWith('image/')) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      // Redimensionne a 800px max pour reduire la taille envoyee a l'API
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

// Verifie que les 3 dimensions sont renseignees, active/desactive le bouton Analyser
function checkDims() {
  var L = +g('dimL').value;
  var H = +g('dimH').value;
  var P = +g('dimP').value;
  g('btnAnalyze').disabled = !(L > 0 && H > 0 && P > 0);
}

// Reset complet : efface image, dimensions, resultats
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
  g('btnAnalyze').disabled = true;
}
