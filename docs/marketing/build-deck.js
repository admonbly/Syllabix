const pptxgen = require('pptxgenjs');
const p = new pptxgen();
p.defineLayout({ name: 'W', width: 13.333, height: 7.5 });
p.layout = 'W';

const NAVY='1A237E', NAVYDK='121854', ORANGE='E67E22', GREEN='27AE60';
const INK='14152B', MUTED='5B5F7A', WHITE='FFFFFF', PAPER='F7F8FC';
const SNAVY='ECEFFC', SORANGE='FDF0E3', SGREEN='E8F7EE';
const HF='Calibri', BF='Calibri';
const W=13.333, H=7.5, M=0.7;

function bg(s,c){ s.background={color:c}; }
function shadow(){ return { type:'outer', color:'8A8FB0', opacity:0.28, blur:9, offset:3, angle:90 }; }
function card(s,x,y,w,h,fill){ s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:0.12,fill:{color:fill||WHITE},line:{color:'E7E8F0',width:1},shadow:shadow()}); }
function circle(s,x,y,d,fill,txt,tc){ s.addShape(p.ShapeType.ellipse,{x,y,w:d,h:d,fill:{color:fill}});
  s.addText(txt,{x,y,w:d,h:d,align:'center',valign:'middle',fontFace:HF,bold:true,color:tc||WHITE,fontSize:15,margin:0}); }
function eyebrow(s,x,y,t,c){ s.addText(t.toUpperCase(),{x,y,w:8,h:0.3,fontFace:HF,bold:true,color:c||ORANGE,fontSize:12,charSpacing:2,margin:0}); }

// ---------- 1. TITLE ----------
let s=p.addSlide(); bg(s,NAVYDK);
s.addShape(p.ShapeType.ellipse,{x:9.7,y:-2.2,w:6.5,h:6.5,fill:{color:NAVY}});
s.addShape(p.ShapeType.ellipse,{x:11.4,y:3.6,w:4.2,h:4.2,fill:{color:'2A2F86'}});
s.addShape(p.ShapeType.roundRect,{x:M,y:0.85,w:0.9,h:0.9,rectRadius:0.18,fill:{color:ORANGE}});
s.addText('S',{x:M,y:0.85,w:0.9,h:0.9,align:'center',valign:'middle',fontFace:HF,bold:true,color:WHITE,fontSize:30,margin:0});
s.addText('Syllabix',{x:1.75,y:0.9,w:6,h:0.8,fontFace:HF,bold:true,color:WHITE,fontSize:30,margin:0});
s.addText('Certification des compétences numériques — Afrique',{x:1.77,y:1.55,w:8,h:0.4,fontFace:BF,color:'B9BEE8',fontSize:13,margin:0});
s.addText([
  {text:'Évaluer et ',options:{color:WHITE}},
  {text:'certifier',options:{color:ORANGE}},
  {text:' les compétences numériques,',options:{color:WHITE}},
],{x:M,y:2.9,w:9.7,h:1.6,fontFace:HF,bold:true,fontSize:40,lineSpacing:44,margin:0});
s.addText('avec des épreuves pratiques sur de vrais fichiers.',{x:M,y:4.15,w:9.7,h:0.7,fontFace:HF,bold:true,color:WHITE,fontSize:40,margin:0});
s.addText('Adaptée au contexte ivoirien et africain. Gratuite pour l’apprenant au démarrage.',{x:M,y:5.15,w:8.6,h:0.5,fontFace:BF,color:'C6CAF0',fontSize:15,margin:0});
s.addShape(p.ShapeType.roundRect,{x:M,y:6.05,w:2.15,h:0.5,rectRadius:0.25,fill:{color:'23297E'},line:{color:ORANGE,width:1}});
s.addText('PROJET PILOTE',{x:M,y:6.05,w:2.15,h:0.5,align:'center',valign:'middle',fontFace:HF,bold:true,color:ORANGE,fontSize:12,charSpacing:2,margin:0});
s.addText('syllabix-eight.vercel.app',{x:9.4,y:6.15,w:3.2,h:0.4,align:'right',fontFace:BF,color:'B9BEE8',fontSize:13,margin:0});
s.addNotes('Ouverture. Syllabix certifie les compétences numériques par des épreuves pratiques sur de vrais fichiers, dans le contexte africain. Stade pilote assumé.');

// ---------- 2. LE CONSTAT ----------
s=p.addSlide(); bg(s,WHITE);
eyebrow(s,M,0.7,'Le constat',ORANGE);
s.addText('Des compétences numériques réelles, mais rarement prouvées',{x:M,y:1.05,w:11.9,h:1,fontFace:HF,bold:true,color:INK,fontSize:32,margin:0});
const constat=[
  ['Un décalage','Beaucoup de jeunes et de salariés utilisent le numérique au quotidien, sans aucune certification qui l’atteste auprès d’un employeur.'],
  ['Un frein à l’emploi','Sans preuve objective de niveau, difficile de se démarquer — pour le candidat comme pour l’entreprise qui recrute.'],
  ['Peu d’outils adaptés','Les référentiels existants sont souvent hors-sol : ni Mobile Money, ni applications locales, ni réalités du terrain africain.'],
];
constat.forEach((c,i)=>{ const x=M+i*(3.97+0.18); card(s,x,2.4,3.97,3.5,WHITE);
  circle(s,x+0.35,2.75,0.7,[NAVY,ORANGE,GREEN][i],String(i+1),WHITE);
  s.addText(c[0],{x:x+0.35,y:3.65,w:3.3,h:0.5,fontFace:HF,bold:true,color:INK,fontSize:19,margin:0});
  s.addText(c[1],{x:x+0.35,y:4.2,w:3.35,h:1.55,fontFace:BF,color:MUTED,fontSize:13.5,lineSpacing:19,margin:0});
});
s.addNotes('Le problème : des compétences bien réelles mais non certifiées, un frein à l’employabilité, et peu d’outils adaptés au contexte local.');

// ---------- 3. LA SOLUTION ----------
s=p.addSlide(); bg(s,NAVYDK);
eyebrow(s,M,0.7,'La solution',ORANGE);
s.addText('Une plateforme qui évalue, entraîne et certifie',{x:M,y:1.05,w:11.9,h:0.9,fontFace:HF,bold:true,color:WHITE,fontSize:32,margin:0});
s.addText('Syllabix mesure le niveau numérique par des mises en situation concrètes — puis délivre un certificat vérifiable en ligne, valable 2 ans, et des badges partageables.',
  {x:M,y:2.0,w:11.6,h:0.9,fontFace:BF,color:'C6CAF0',fontSize:16,lineSpacing:23,margin:0});
const stats=[['7','Modules'],['21','Compétences'],['32','Questions'],['1h45','Certification'],['2 ans','Validité']];
stats.forEach((st,i)=>{ const w=2.2, gap=0.15, x=M+i*(w+gap);
  s.addShape(p.ShapeType.roundRect,{x,y:3.5,w,h:1.8,rectRadius:0.12,fill:{color:'20267A'}});
  s.addText(st[0],{x,y:3.7,w,h:0.9,align:'center',fontFace:HF,bold:true,color:WHITE,fontSize:34,margin:0});
  s.addText(st[1],{x,y:4.65,w,h:0.4,align:'center',fontFace:BF,color:'A8ADE0',fontSize:13,margin:0});
});
s.addText('Épreuves pratiques sur de vrais fichiers Excel, Word et PDF — pas seulement du QCM.',
  {x:M,y:5.7,w:11.6,h:0.5,fontFace:BF,italic:true,color:ORANGE,fontSize:15,margin:0});
s.addNotes('La solution : évaluer par la pratique, certifier de façon vérifiable, et récompenser par des badges partageables. Chiffres structurels, réels par construction.');

// ---------- 4. COMMENT CA MARCHE ----------
s=p.addSlide(); bg(s,WHITE);
eyebrow(s,M,0.7,'Comment ça marche',ORANGE);
s.addText('Du test sans engagement au certificat reconnu',{x:M,y:1.05,w:11.9,h:0.9,fontFace:HF,bold:true,color:INK,fontSize:32,margin:0});
const steps=[
  ['Teste ton niveau','Défi gratuit de 15 minutes, sans compte. La porte d’entrée sans friction.',SNAVY,NAVY],
  ['Entraîne-toi','7 modules, exercices adaptatifs, feedback immédiat après chaque réponse.',SORANGE,ORANGE],
  ['Certifie-toi','Certificat vérifiable en ligne (2 ans) + badges partageables sur LinkedIn et WhatsApp.',SGREEN,GREEN],
];
steps.forEach((st,i)=>{ const y=2.35+i*1.55; card(s,M,y,11.9,1.35,WHITE);
  circle(s,M+0.35,y+0.3,0.75,st[3],String(i+1),WHITE);
  s.addText(st[0],{x:M+1.4,y:y+0.22,w:4,h:0.5,fontFace:HF,bold:true,color:INK,fontSize:20,margin:0});
  s.addText(st[1],{x:M+1.4,y:y+0.68,w:10,h:0.6,fontFace:BF,color:MUTED,fontSize:14,margin:0});
});
s.addNotes('Trois temps : défi gratuit (accroche), entraînement, puis certification. Le défi rend le tout viral et sans friction.');

// ---------- 5. LE REFERENTIEL ----------
s=p.addSlide(); bg(s,PAPER);
eyebrow(s,M,0.7,'Le référentiel',ORANGE);
s.addText('7 domaines, du poste de travail à l’intelligence artificielle',{x:M,y:1.05,w:11.9,h:0.9,fontFace:HF,bold:true,color:INK,fontSize:30,margin:0});
const mods=[['IT & Ordinateur',NAVY],['Internet','0277BD'],['Email','00695C'],['Bureautique',ORANGE],['Cybersécurité','B71C1C'],['Intelligence artificielle','6A1B9A'],['Employabilité',GREEN]];
mods.forEach((m,i)=>{ const col=i%4, row=Math.floor(i/4); const w=2.9, gap=0.16;
  const x=M+col*(w+gap), y=2.35+row*1.9;
  card(s,x,y,w,1.65,WHITE);
  circle(s,x+0.3,y+0.32,0.6,m[1],String(i+1),WHITE);
  s.addText(m[0],{x:x+0.28,y:y+1.02,w:w-0.5,h:0.55,fontFace:HF,bold:true,color:INK,fontSize:15,margin:0});
});
s.addText('Chaque module couvre 3 compétences concrètes, évaluées en situation.',{x:M,y:6.35,w:11.9,h:0.4,fontFace:BF,italic:true,color:MUTED,fontSize:14,margin:0});
s.addNotes('Le référentiel : 7 domaines, 21 compétences. Couvre le socle numérique jusqu’à l’IA et l’employabilité.');

// ---------- 6. CE QUI NOUS DISTINGUE ----------
s=p.addSlide(); bg(s,WHITE);
eyebrow(s,M,0.7,'Ce qui nous distingue',ORANGE);
s.addText('Concret, local, et fait pour se partager',{x:M,y:1.05,w:11.9,h:0.9,fontFace:HF,bold:true,color:INK,fontSize:32,margin:0});
const edge=[
  ['Épreuves pratiques','Sur de vrais fichiers Excel, Word, PDF. On évalue ce que la personne sait faire, pas ce qu’elle sait réciter.'],
  ['Contexte local','Mobile Money, applications africaines, situations du quotidien ivoirien. Un référentiel qui parle au terrain.'],
  ['Badges viraux','Chaque réussite se partage sur les réseaux et fait grandir la communauté des certifiés.'],
  ['Vérifiable & daté','Certificat consultable en ligne par n’importe quel employeur, valable 2 ans.'],
];
edge.forEach((e,i)=>{ const col=i%2, row=Math.floor(i/2); const w=5.85, gap=0.2;
  const x=M+col*(w+gap), y=2.4+row*1.85;
  card(s,x,y,w,1.6,WHITE);
  circle(s,x+0.32,y+0.32,0.62,[NAVY,ORANGE,GREEN,'6A1B9A'][i],'✓',WHITE);
  s.addText(e[0],{x:x+1.2,y:y+0.24,w:w-1.4,h:0.45,fontFace:HF,bold:true,color:INK,fontSize:17,margin:0});
  s.addText(e[1],{x:x+1.2,y:y+0.68,w:w-1.45,h:0.8,fontFace:BF,color:MUTED,fontSize:13,lineSpacing:17,margin:0});
});
s.addNotes('Quatre différenciateurs : pratique, local, viral, vérifiable.');

// ---------- 7. POUR QUI (cascade) ----------
s=p.addSlide(); bg(s,NAVYDK);
eyebrow(s,M,0.7,'Pour qui',ORANGE);
s.addText('Une communauté qui se construit en cascade',{x:M,y:1.05,w:11.9,h:0.9,fontFace:HF,bold:true,color:WHITE,fontSize:32,margin:0});
const casc=[
  ['Apprenants','Demandeurs d’emploi, salariés, curieux : ils testent, s’entraînent et se certifient — gratuitement au démarrage.',ORANGE],
  ['Écoles & entreprises','Elles amènent des cohortes, suivent la progression via un tableau de bord, et valorisent leurs profils.',WHITE],
  ['Institutions & programmes','Elles s’appuient sur des pilotes mesurés au service de l’employabilité et de l’inclusion numérique.','8FE3B0'],
];
casc.forEach((c,i)=>{ const x=M+i*(3.97+0.18); s.addShape(p.ShapeType.roundRect,{x,y:2.4,w:3.97,h:3.4,rectRadius:0.12,fill:{color:'1B2270'}});
  s.addText(String(i+1),{x:x+0.35,y:2.65,w:1,h:0.7,fontFace:HF,bold:true,color:c[2],fontSize:30,margin:0});
  s.addText(c[0],{x:x+0.35,y:3.5,w:3.3,h:0.5,fontFace:HF,bold:true,color:WHITE,fontSize:18,margin:0});
  s.addText(c[1],{x:x+0.35,y:4.05,w:3.35,h:1.6,fontFace:BF,color:'BEC3EC',fontSize:13,lineSpacing:18,margin:0});
});
s.addText('Chaque étage fabrique la preuve qui convainc le suivant.',{x:M,y:6.15,w:11.9,h:0.4,fontFace:BF,italic:true,color:ORANGE,fontSize:14,margin:0});
s.addNotes('La cascade : les apprenants créent la preuve, qui ouvre les écoles/entreprises, qui ouvrent l’institutionnel.');

// ---------- 8. MODELE ECONOMIQUE ----------
s=p.addSlide(); bg(s,WHITE);
eyebrow(s,M,0.7,'Le modèle',ORANGE);
s.addText('Gratuit pour amorcer, soutenable ensuite',{x:M,y:1.05,w:11.9,h:0.9,fontFace:HF,bold:true,color:INK,fontSize:32,margin:0});
const model=[
  ['Gratuit','Défi, entraînement, badges d’apprentissage. Le carburant qui fait connaître la plateforme.',SGREEN,GREEN],
  ['Codes de certification','La certification se débloque par un code — offert aux premiers, distribué aux partenaires (dotations, campagnes).',SNAVY,NAVY],
  ['Bientôt payant','Paiement Mobile Money (Orange, MTN, Moov, Wave) et carte, et lots pour les partenaires.',SORANGE,ORANGE],
];
model.forEach((m,i)=>{ const x=M+i*(3.97+0.18); card(s,x,2.4,3.97,3.4,WHITE);
  s.addShape(p.ShapeType.roundRect,{x:x+0.35,y:2.7,w:1.6,h:0.5,rectRadius:0.25,fill:{color:m[2]}});
  s.addText(m[0].toUpperCase(),{x:x+0.35,y:2.7,w:1.6,h:0.5,align:'center',valign:'middle',fontFace:HF,bold:true,color:m[3],fontSize:11,charSpacing:1,margin:0});
  s.addText(m[1],{x:x+0.35,y:3.55,w:3.35,h:2,fontFace:BF,color:MUTED,fontSize:14,lineSpacing:20,margin:0});
});
s.addText('Au stade pilote, tout est gratuit : on construit d’abord la communauté et la preuve.',{x:M,y:6.15,w:11.9,h:0.4,fontFace:BF,italic:true,color:MUTED,fontSize:14,margin:0});
s.addNotes('Modèle : gratuit pour amorcer, certification par code, paiement Mobile Money à venir. B2B (vouchers partenaires) au cœur.');

// ---------- 9. OU ON EN EST ----------
s=p.addSlide(); bg(s,PAPER);
eyebrow(s,M,0.7,'Où en sommes-nous',ORANGE);
s.addText('Un produit qui fonctionne, une posture honnête',{x:M,y:1.05,w:11.9,h:0.9,fontFace:HF,bold:true,color:INK,fontSize:32,margin:0});
card(s,M,2.4,5.85,3.4,WHITE);
s.addText('En ligne, aujourd’hui',{x:M+0.4,y:2.7,w:5,h:0.5,fontFace:HF,bold:true,color:NAVY,fontSize:19,margin:0});
['Plateforme fonctionnelle et accessible','Défi public, entraînement, certification','Certificats vérifiables & badges partageables','Tableau de bord pour les organisations'].forEach((t,i)=>{
  s.addShape(p.ShapeType.ellipse,{x:M+0.4,y:3.35+i*0.55,w:0.16,h:0.16,fill:{color:GREEN}});
  s.addText(t,{x:M+0.72,y:3.22+i*0.55,w:4.9,h:0.45,fontFace:BF,color:INK,fontSize:13.5,margin:0});
});
card(s,M+6.05,2.4,5.85,3.4,NAVYDK);
s.addText('Notre honnêteté',{x:M+6.45,y:2.7,w:5,h:0.5,fontFace:HF,bold:true,color:ORANGE,fontSize:19,margin:0});
s.addText('Nous sommes au stade pilote. Nous ne communiquons aucun chiffre d’usage ni aucune caution que nous ne pouvons prouver.\n\nCe que nous cherchons : des partenaires pilotes pour valider et faire grandir la plateforme ensemble.',
  {x:M+6.45,y:3.3,w:5.05,h:2.3,fontFace:BF,color:'C6CAF0',fontSize:14,lineSpacing:20,margin:0});
s.addNotes('Transparence : produit en ligne et fonctionnel, mais stade pilote assumé, aucune fausse caution. On cherche des partenaires pilotes.');

// ---------- 10. DEVENIR PARTENAIRE ----------
s=p.addSlide(); bg(s,WHITE);
eyebrow(s,M,0.7,'Passons à l’action',ORANGE);
s.addText('Devenez partenaire pilote',{x:M,y:1.05,w:11.9,h:0.9,fontFace:HF,bold:true,color:INK,fontSize:34,margin:0});
const act=[
  ['Écoles & universités','Lancez une cohorte pilote : dotation de codes offerts, suivi de progression, certificat qui valorise l’établissement.',NAVY],
  ['Entreprises','Testez le niveau numérique réel de vos candidats et employés, avec un reporting clair par compétence.',ORANGE],
  ['Institutions','Co-construisons un outil pilote mesurable au service de l’employabilité et de l’inclusion numérique.',GREEN],
];
act.forEach((a,i)=>{ const y=2.3+i*1.35; card(s,M,y,11.9,1.2,WHITE);
  s.addShape(p.ShapeType.roundRect,{x:M+0.3,y:y+0.3,w:0.6,h:0.6,rectRadius:0.12,fill:{color:a[2]}});
  s.addText(a[0],{x:M+1.15,y:y+0.18,w:4,h:0.45,fontFace:HF,bold:true,color:INK,fontSize:18,margin:0});
  s.addText(a[1],{x:M+1.15,y:y+0.6,w:10.4,h:0.5,fontFace:BF,color:MUTED,fontSize:13.5,margin:0});
});
s.addNotes('Appel à l’action différencié par public. Toujours une classe/équipe pilote pour commencer.');

// ---------- 11. CLOSING ----------
s=p.addSlide(); bg(s,NAVYDK);
s.addShape(p.ShapeType.ellipse,{x:-2,y:4.5,w:6,h:6,fill:{color:NAVY}});
s.addShape(p.ShapeType.roundRect,{x:M,y:1.6,w:0.8,h:0.8,rectRadius:0.16,fill:{color:ORANGE}});
s.addText('S',{x:M,y:1.6,w:0.8,h:0.8,align:'center',valign:'middle',fontFace:HF,bold:true,color:WHITE,fontSize:26,margin:0});
s.addText('Faisons grandir la communauté\ndes certifiés numériques.',{x:M,y:2.7,w:11,h:1.8,fontFace:HF,bold:true,color:WHITE,fontSize:38,lineSpacing:44,margin:0});
s.addText('Tester le défi, découvrir les modules, ou devenir partenaire :',{x:M,y:4.7,w:11,h:0.5,fontFace:BF,color:'C6CAF0',fontSize:16,margin:0});
s.addText([
  {text:'syllabix-eight.vercel.app',options:{color:WHITE,bold:true,breakLine:true}},
  {text:'Partenariats : /partenariats     ·     Défi : /defi',options:{color:'A8ADE0'}},
],{x:M,y:5.35,w:11,h:0.9,fontFace:BF,fontSize:17,lineSpacing:26,margin:0});
s.addText('Projet pilote — nous n’affirmons rien que nous ne puissions prouver.',{x:M,y:6.7,w:11,h:0.4,fontFace:BF,italic:true,color:'7C82C0',fontSize:12,margin:0});
s.addNotes('Clôture et appel à l’action : tester, découvrir, devenir partenaire. Rappel de la posture honnête.');

p.writeFile({ fileName: 'Syllabix-pitch-deck.pptx' }).then(f=>console.log('OK', f));
