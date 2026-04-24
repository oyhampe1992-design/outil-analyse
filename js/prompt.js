/* ================================================================
   THE WOODER - prompt.js
   ================================================================
   Construction du prompt envoye a l'API Claude pour l'analyse photo.
   Facile a modifier/ameliorer sans toucher au reste.
   Depend de : state.js
   ================================================================ */

function construirePrompt(L, H, P) {
  return [
    'Tu es menuisier fabricant experimente. Analyse cette photo pour identifier chaque element de fabrication separe.',
    '',
    'DIMENSIONS TOTALES CONNUES (donnees par l\'utilisateur, a utiliser en priorite) :',
    '- Largeur totale : ' + L + ' cm',
    '- Hauteur totale : ' + H + ' cm',
    '- Profondeur totale : ' + P + ' cm',
    'Utilise ces valeurs EXACTES pour ensemble.dimensions_totales et repartis les elements dans cet espace.',
    '',
    'NOMENCLATURE :',
    '- COL = Colonne pleine hauteur',
    '- CB = Caisson bas (pose au sol)',
    '- CH = Caisson haut (fixe en hauteur)',
    '- NO = Niche ouverte',
    '- DC = Demi-colonne',
    'Sous-elements : PB=porte battante, PC=porte coulissante, TIR=tiroir, ETG=etagere, PEND=penderie, MI=montant intermediaire, PLI=plinthe.',
    '',
    'REGLES CRITIQUES DE DECOMPOSITION :',
    '',
    '1. MONTANTS VS LIGNES ENTRE PORTES :',
    '   - Une simple ligne verticale fine entre 2 portes dans un meme caisson = ce n\'est PAS un montant, c\'est juste le jeu entre les portes. Mettre MI=0.',
    '   - Un vrai montant intermediaire = un panneau structurel d\'environ 18mm visible, qui divise l\'interieur du caisson en colonnes. On le voit car il a une epaisseur et parfois une couleur legerement differente.',
    '   - Si tu hesites : regarde si les poignees des 2 portes sont proches (= meme caisson, pas de MI) ou tres eloignees (= possible montant).',
    '',
    '2. JOUES CONTINUES :',
    '   - Si les joues laterales montent du bas en haut sans coupure = 1 SEUL element, meme avec plusieurs portes empilees.',
    '   - Si tu vois une ligne horizontale qui separe clairement 2 meubles (changement de materiau, joue doublee) = 2 elements separes.',
    '',
    '3. COLONNES COTE A COTE :',
    '   - 2 colonnes independantes avec joues doublees entre elles = 2 elements COL separes.',
    '   - Si ambigu, prefere scinder en plusieurs elements independants (plus simple a fabriquer).',
    '',
    '4. COMPTAGE PRECIS DES PORTES ET TIROIRS :',
    '   - Pour CHAQUE element, compter EXACTEMENT toutes les portes visibles (haut + bas si empilees).',
    '   - Compter TOUS les tiroirs visibles, meme petits.',
    '   - Un caisson avec 2 portes en haut et 2 tiroirs en bas : PB=2 ET TIR=2.',
    '   - Ne jamais oublier les tiroirs en partie basse d\'une colonne.',
    '',
    '5. NICHES OUVERTES :',
    '   - Une niche ouverte (pas de portes) dans un materiau different = TOUJOURS un element NO separe.',
    '   - Compter precisement les etageres visibles dans la niche.',
    '',
    '6. PORTES ET PLINTHE : EN APPLIQUE par defaut (recouvrent le cadre).',
    '',
    '7. MURS BLANCS : ne pas confondre un mur blanc avec un montant de meuble.',
    '',
    'METHODE D\'ANALYSE :',
    'a) Scanner de GAUCHE a DROITE',
    'b) Pour chaque colonne/zone, scanner de BAS en HAUT',
    'c) Pour chaque element : compter exactement portes haut, portes bas, tiroirs',
    'd) Materiau different = element separe',
    '',
    'Reponds UNIQUEMENT en JSON :',
    '{"ensemble":{"nom_client":"","nom_technique":"","style":"","materiau_apparent":"","dimensions_totales":{"hauteur":' + H + ',"largeur":' + L + ',"profondeur":' + P + '},"particularites":[]},"elements":[{"id":"","nom_client":"","nom_technique":"","type":"","zone_horizontale":"","largeur":0,"hauteur":0,"profondeur":0,"facade":{"type":"","nb_portes":0,"nb_tiroirs":0,"nb_etg":0,"detail_portes":"","pose":"applique"},"sous_elements":{"MI":0,"PB":0,"PC":0,"TIR":0,"ETG":0,"PEND":0,"PLI":"applique"}}]}'
  ].join('\n');
}
