
(function(){
  var D=window.BDT_TERMINE; if(!D) return;
  var M=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  var T=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
  function parse(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
  function fmt(d,z){return T[d.getDay()]+', '+d.getDate()+'. '+M[d.getMonth()]+' '+d.getFullYear()+(z?', '+z+' Uhr':'')}
  var now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  function treffen(n){
    var r=D.treffen,out=[],y=today.getFullYear(),m=today.getMonth(),wd=(r.wochentag+1)%7;
    while(out.length<n){
      var d=new Date(y,m,1),k=0;
      while(true){if(d.getDay()===wd){k++;if(k===r.nummer)break}d.setDate(d.getDate()+1)}
      if(d>=today&&r.ausfall.indexOf(iso(d))<0)out.push(d);
      m++;if(m>11){m=0;y++}
    }
    return out;
  }
  var all=D.events.map(function(e){return{d:parse(e.datum),z:e.zeit,t:e.titel,x:e.text,link:e.link}});
  var fut=all.filter(function(e){return e.d>=today});
  var past=all.filter(function(e){return e.d<today});
  var belegt={};D.events.forEach(function(e){belegt[e.datum+'|'+e.titel]=1});
  treffen(D.treffen.anzahl).forEach(function(d){if(belegt[iso(d)+'|'+D.treffen.titel])return;fut.push({d:d,z:D.treffen.zeit,t:D.treffen.titel,x:D.treffen.text})});
  function cmp(a,b){return a.d-b.d||(a.z>b.z?1:-1)}
  fut.sort(cmp);past.sort(cmp);
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
  function li(e){return '<li><time datetime="'+iso(e.d)+'">'+fmt(e.d,e.z)+'</time><h3>'+esc(e.t)+'</h3><p>'+esc(e.x)+(e.link?' <a href="'+e.link+'">Mehr Informationen</a>':'')+'</p></li>'}
  var z=document.getElementById('tl-zukunft'),v=document.getElementById('tl-vergangen');
  if(z)z.innerHTML=fut.map(li).join('');
  if(v)v.innerHTML=past.map(li).join('');
  // Strukturierte Daten für kommende Termine (Suchmaschinen, KI-Assistenten)
  if(z&&fut.length){
    var ev=fut.slice(0,8).map(function(e){return{"@type":"Event","name":e.t,"description":e.x,"startDate":iso(e.d)+(e.z?'T'+e.z+':00':''),"eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","location":(e.t==="Bündnistreffen"?{"@type":"Place","name":"Gemeindezentrum der Ev. Kirchengemeinde Marwitz-Velten","address":{"@type":"PostalAddress","streetAddress":"Breite Straße 17","postalCode":"16727","addressLocality":"Velten","addressCountry":"DE"}}:{"@type":"Place","name":"Velten","address":{"@type":"PostalAddress","addressLocality":"Velten","addressRegion":"Brandenburg","addressCountry":"DE"}}),"organizer":{"@type":"Organization","name":"Bündnis für Dialog und Toleranz","url":"https://www.dialog-und-toleranz.de/"},"isAccessibleForFree":true}});
    var sc=document.createElement('script');sc.type='application/ld+json';sc.textContent=JSON.stringify({"@context":"https://schema.org","@graph":ev});document.head.appendChild(sc);
  }

  // Startseite: nächster Termin, abgelaufene Ankündigungen ausblenden
  var n=document.getElementById('naechster');
  if(n&&fut.length){document.getElementById('naechster-text').textContent=fut[0].t+', '+fmt(fut[0].d,fut[0].z)+'.';n.hidden=false}
  document.querySelectorAll('[data-bis]').forEach(function(el){if(parse(el.getAttribute('data-bis'))<today)el.hidden=true});
})();

document.querySelectorAll('[data-copy]').forEach(function(b){
  var label=b.textContent;
  b.addEventListener('click',function(){
    var t=b.getAttribute('data-copy');
    function ok(){b.textContent='Kopiert';setTimeout(function(){b.textContent=label},1800)}
    function fb(){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){b.textContent='Bitte manuell kopieren'}a.remove()}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,fb)}else{fb()}
  });
});
