const levels = [
  {name:'Cellen', seconds:55, speed:215, questions:[
    ['Welk deel van de cel bevat bij mensen het meeste DNA?', 'Celkern', 'Celmembraan', 'Cytoplasma'],
    ['Wat vormt de grens tussen een dierlijke cel en haar omgeving?', 'Celmembraan', 'Celkern', 'Bladgroenkorrel'],
    ['Wat hebben plantencellen wel en dierlijke cellen niet?', 'Een celwand', 'Een celmembraan', 'Cytoplasma'],
    ['Hoe noem je een groep cellen met dezelfde taak?', 'Een weefsel', 'Een orgaanstelsel', 'Een organisme']]},
  {name:'Planten', seconds:65, speed:185, questions:[
    ['Welk gas neemt een plant op voor fotosynthese?', 'Koolstofdioxide', 'Zuurstof', 'Helium'],
    ['Welk deel neemt bij de meeste planten water op uit de bodem?', 'De wortels', 'De bloemen', 'De vruchten'],
    ['Welke energiebron gebruikt een plant bij fotosynthese?', 'Licht', 'Geluid', 'Wind'],
    ['Welke suiker wordt in het gebruikelijke reactieschema van fotosynthese gevormd?', 'Glucose', 'Lactose', 'Sacharose']]},
  {name:'Het menselijk lichaam', seconds:75, speed:155, questions:[
    ['Welk orgaan pompt bloed door je lichaam?', 'Het hart', 'De maag', 'De lever'],
    ['Welke bloedcellen vervoeren de meeste zuurstof?', 'Rode bloedcellen', 'Witte bloedcellen', 'Bloedplaatjes'],
    ['Waar wordt het grootste deel van de voedingsstoffen opgenomen?', 'In de dunne darm', 'In de slokdarm', 'In de maag'],
    ['Waar gaat zuurstof vanuit de ingeademde lucht het bloed in?', 'In de longblaasjes', 'In de luchtpijp', 'In het middenrif']]},
  {name:'Ecosystemen', seconds:85, speed:130, questions:[
    ['Welk organisme is een producent in een weiland?', 'Gras', 'Een koe', 'Een regenworm'],
    ['Welke organismen breken dood materiaal af?', 'Veel schimmels en bacteriën', 'Vooral roofvogels', 'Vooral bloeiende planten'],
    ['Welke volgorde past bij een voedselketen?', 'Gras → konijn → vos', 'Vos → konijn → gras', 'Konijn → gras → vos'],
    ['Wat is een abiotische factor in een bos?', 'Temperatuur', 'Een eik', 'Een specht']]},
  {name:'Erfelijkheid', seconds:95, speed:105, questions:[
    ['Wat is een gen?', 'Een stukje DNA met erfelijke informatie', 'Een soort bloedcel', 'Een deel van een bot'],
    ['Hoe heet een verandering in de volgorde van DNA?', 'Een mutatie', 'Een vertering', 'Een ademhaling'],
    ['Hoe heet een variant van een gen?', 'Een allel', 'Een weefsel', 'Een voedingsstof'],
    ['Hoeveel chromosomen heeft een menselijke eicel meestal?', '23', '46', '92']]},
  {name:'Zintuigen', seconds:100, speed:100, questions:[
    ['Welk deel van het oog bevat lichtgevoelige cellen?', 'Het netvlies', 'De iris', 'Het hoornvlies'],
    ['Wat gebeurt er met je pupil bij fel licht?', 'Die wordt kleiner', 'Die wordt groter', 'Die verandert niet'],
    ['Welk deel van het oor zet trillingen om in zenuwsignalen?', 'Het slakkenhuis', 'De oorschelp', 'Het trommelvlies'],
    ['Welke zenuw voert signalen van het oog naar de hersenen?', 'De oogzenuw', 'De gehoorzenuw', 'De reukzenuw']]},
  {name:'Afweer', seconds:105, speed:95, questions:[
    ['Welke bloedcellen spelen een belangrijke rol bij afweer?', 'Witte bloedcellen', 'Rode bloedcellen', 'Bloedplaatjes'],
    ['Welke structuur houdt veel ziekteverwekkers buiten je lichaam?', 'Een intacte huid', 'De ribben', 'Het middenrif'],
    ['Waar kunnen antistoffen zich specifiek aan binden?', 'Aan antigenen', 'Aan alle suikers', 'Aan watermoleculen'],
    ['Welke cellen helpen je afweer sneller te reageren bij een volgende besmetting?', 'Geheugencellen', 'Spiercellen', 'Botcellen']]},
  {name:'Voortplanting', seconds:110, speed:90, questions:[
    ['Hoe heet het samensmelten van een zaadcel en een eicel?', 'Bevruchting', 'Eisprong', 'Innesteling'],
    ['Waar ontwikkelt een menselijk embryo zich gewoonlijk na innesteling?', 'In de baarmoeder', 'In de eierstok', 'In de blaas'],
    ['Wat wordt bij bestuiving overgebracht naar de stempel van een bloem?', 'Stuifmeel', 'Een zaad', 'Een wortel'],
    ['Bij welk proces ontstaat een nakomeling uit één ouder zonder bevruchting?', 'Ongeslachtelijke voortplanting', 'Geslachtelijke voortplanting', 'Bestuiving']]},
  {name:'Evolutie', seconds:115, speed:85, questions:[
    ['Welk proces kan een erfelijke eigenschap vaker laten voorkomen als die meer nakomelingen oplevert?', 'Natuurlijke selectie', 'Fotosynthese', 'Celademhaling'],
    ['Wat kan een fossiel ons laten zien?', 'Hoe organismen vroeger eruitzagen', 'Welke soorten morgen ontstaan', 'Hoe oud alle levende dieren zijn'],
    ['Wat hebben twee nauw verwante soorten vaak?', 'Een relatief recente gemeenschappelijke voorouder', 'Precies hetzelfde DNA', 'Altijd hetzelfde leefgebied'],
    ['Wat kan nieuwe erfelijke variatie opleveren?', 'Een mutatie in het DNA van een geslachtscel', 'Een litteken op je hand', 'Een spier die groter wordt door trainen']]},
  {name:'Kringlopen', seconds:120, speed:80, questions:[
    ['Bij welk proces leggen planten koolstof uit koolstofdioxide vast?', 'Fotosynthese', 'Verdamping', 'Bestuiving'],
    ['Wat komt vrij als organismen glucose met zuurstof afbreken?', 'Koolstofdioxide en water', 'Zuurstof en glucose', 'Alleen stikstof'],
    ['Hoe heet de overgang van waterdamp naar vloeibaar water?', 'Condensatie', 'Verdamping', 'Bevriezing'],
    ['Welke organismen kunnen stikstofgas omzetten in verbindingen die planten kunnen benutten?', 'Bepaalde bacteriën', 'Alle zoogdieren', 'Alle bloeiende planten']]}
];
export default levels.flatMap(level => level.questions);
