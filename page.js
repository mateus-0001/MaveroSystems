(function(){
  var html=document.documentElement;
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(RM) html.classList.add('rm');
  document.getElementById('year').textContent=new Date().getFullYear();
  if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined'){html.classList.add('nogsap');return;}
  gsap.registerPlugin(ScrollTrigger);
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var header=$('#site-header');

  /* ---- helpers ---- */
  function split(el,mode){
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var frag=document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(tok){
            if(!tok)return;
            if(/^\s+$/.test(tok)){return;}
            var w=document.createElement('span');
            if(mode==='mask'){w.className='mask';var r=document.createElement('span');r.className='rise';r.textContent=tok;w.appendChild(r);}
            else{w.className='sw';w.textContent=tok;}
            frag.appendChild(w);
            if(mode==='mask') frag.appendChild(document.createTextNode(' '));
          });
          n.replaceWith(frag);
        }else if(n.nodeType===1&&n.tagName!=='BR'&&n.tagName!=='IMG'){walk(n);}
      });
    })(el);
  }

  /* ---- marquee (always built; animated unless reduced motion) ---- */
  var phrases=['Sites sob medida','Alta performance','Foco em conversão','100% responsivo','Design moderno'];
  var tweens=[];
  $$('.track').forEach(function(t,i){
    var list=i%2?phrases.slice().reverse():phrases;
    var g=document.createElement('div');g.className='group';
    list.forEach(function(p){g.insertAdjacentHTML('beforeend','<span>'+p+'</span><i class="hd"></i>');});
    t.appendChild(g);t.appendChild(g.cloneNode(true));
    if(!RM) tweens.push(gsap.fromTo(t,{xPercent:i%2?-50:0},{xPercent:i%2?0:-50,duration:36,ease:'none',repeat:-1}));
  });
  if(tweens.length){
    var sp={v:1},last=window.scrollY;
    gsap.ticker.add(function(){
      var d=Math.abs(window.scrollY-last);last=window.scrollY;
      var target=1+Math.min(d*.35,7);
      sp.v+=(target-sp.v)*.1;
      tweens.forEach(function(t){t.timeScale(sp.v)});
    });
  }

  /* ---- reduced motion: show everything, stop here ---- */
  function finishStatic(){
    var c=$('.svc-prog i');if(c)c.style.transform='scaleX(1)';
    $$('.step').forEach(function(s){s.classList.add('on')});
    $$('.mega .ln').forEach(function(l){l.style.backgroundSize='100% 100%'});
    window.__maveroIntro=true;
    setTimeout(function(){window.dispatchEvent(new Event('mavero:intro'))},60);
  }
  if(RM){finishStatic();buildChart(true);return;}

  /* ---- initial hidden states (loader covers the page meanwhile) ---- */
  gsap.set('.hero .rise',{yPercent:115});
  gsap.set('.hero [data-in]',{opacity:0,y:24});
  gsap.set('.badge',{scale:0,opacity:0});
  gsap.set('.hxw',{opacity:0});
  gsap.set(header,{yPercent:-100});

  /* ---- loader ---- */
  var loader=$('#loader'),num=$('#loadNum'),bar=$('#loadBar'),st={v:0},done=false;
  function paint(){num.textContent=Math.round(st.v);bar.style.transform='scaleX('+(st.v/100)+')';}
  var t0=performance.now();
  var creep=gsap.to(st,{v:90,duration:3.4,ease:'power2.out',onUpdate:paint});
  function finish(){
    if(done)return;done=true;creep.kill();
    gsap.to(st,{v:100,duration:.35,ease:'power1.out',onUpdate:paint,onComplete:reveal});
  }
  // a tela de carregamento espera o logo 3D ficar pronto, com tempo mínimo de 2,6 s; se passar de 3 s, libera a página com o logo normal
  var minDone=false,logoReady=false;
  function tryFinish(){if(minDone&&logoReady)finish();}
  setTimeout(function(){minDone=true;tryFinish();},2600);
  window.addEventListener('mavero:ready',function(){logoReady=true;tryFinish();});
  setTimeout(finish,3000);

  function reveal(){
    var tl=gsap.timeline({defaults:{ease:'power4.out'}});
    tl.to(loader,{yPercent:-100,duration:.9,ease:'power4.inOut'})
      .add(function(){loader.style.display='none';if(!logoReady){window.__maveroLate=true;html.classList.add('slow3d');}window.__maveroIntro=true;window.dispatchEvent(new Event('mavero:intro'));},'-=.35')
      .to('.hero .rise',{yPercent:0,duration:1.25,stagger:.14},'-=.3')
      .to(header,{yPercent:0,duration:.8},'<0.2')
      .to('.hero [data-in]',{opacity:1,y:0,duration:.9,stagger:.1},'<0.2')
      .to('.badge',{scale:1,opacity:1,duration:1,ease:'back.out(1.6)'},'<0.2')
      .to('.hxw',{opacity:1,duration:1.6,stagger:.12},'<');
  }

  /* ---- header: hide on scroll down, show on scroll up ---- */
  var hidden=false;
  ScrollTrigger.create({start:0,end:'max',onUpdate:function(self){
    header.classList.toggle('scrolled',self.scroll()>12);
    var down=self.direction===1&&self.scroll()>240;
    if(down&&!hidden){hidden=true;gsap.to(header,{yPercent:-100,duration:.4,overwrite:true});}
    else if(!down&&hidden&&self.direction===-1){hidden=false;gsap.to(header,{yPercent:0,duration:.4,overwrite:true});}
  }});
  gsap.to('#progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.2}});

  /* ---- custom cursor + magnetic ---- */
  if(window.matchMedia('(pointer:fine)').matches){
    html.classList.add('has-cursor');
    var ring=$('#cursor'),dot=$('#cursorDot');
    var rx=gsap.quickTo(ring,'x',{duration:.45,ease:'power3'}),ry=gsap.quickTo(ring,'y',{duration:.45,ease:'power3'});
    var dx=gsap.quickTo(dot,'x',{duration:.08}),dy=gsap.quickTo(dot,'y',{duration:.08});
    window.addEventListener('pointermove',function(e){rx(e.clientX);ry(e.clientY);dx(e.clientX);dy(e.clientY);},{passive:true});
    document.addEventListener('pointerover',function(e){
      var hit=e.target.closest&&e.target.closest('a,button,.svc-card');
      gsap.to(ring,{scale:hit?1.9:1,duration:.35,ease:'power3.out',overwrite:'auto'});
    });
    $$('.magnetic').forEach(function(el){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect();
        gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.3,y:(e.clientY-r.top-r.height/2)*.3,duration:.4,ease:'power3.out'});
      });
      el.addEventListener('pointerleave',function(){gsap.to(el,{x:0,y:0,duration:.9,ease:'elastic.out(1,.45)'});});
    });
  }

  /* ---- hexagons parallax with the mouse ---- */
  var movers=$$('.hxw').map(function(h){return{d:parseFloat(h.dataset.depth),x:gsap.quickTo(h,'x',{duration:1.3,ease:'power3'}),y:gsap.quickTo(h,'y',{duration:1.3,ease:'power3'})}});
  window.addEventListener('pointermove',function(e){
    var nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;
    movers.forEach(function(m){m.x(nx*m.d*900);m.y(ny*m.d*900);});
  },{passive:true});

  /* ---- headings: word mask reveal ---- */
  $$('.big').forEach(function(h){
    split(h,'mask');
    var r=$$('.rise',h);gsap.set(r,{yPercent:118});
    ScrollTrigger.create({trigger:h,start:'top 86%',once:true,onEnter:function(){gsap.to(r,{yPercent:0,duration:1.05,ease:'power4.out',stagger:.06});}});
  });

  /* ---- statement: words light up with scroll ---- */
  var stm=$('#statement');split(stm,'sw');
  gsap.fromTo($$('.sw',stm),{opacity:.13},{opacity:1,ease:'none',stagger:.12,scrollTrigger:{trigger:stm,start:'top 78%',end:'bottom 48%',scrub:true}});

  /* ---- generic fade-ups ---- */
  $$('[data-fade]').forEach(function(el){
    gsap.set(el,{opacity:0,y:28});
    ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:function(){gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out'});}});
  });

  /* ---- services: pinned horizontal scroll on desktop ---- */
  var mm=gsap.matchMedia();
  mm.add('(min-width:981px)',function(){
    var track=$('.svc-track');
    var dist=function(){return Math.max(0,track.scrollWidth-window.innerWidth);};
    var tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.svc-pin',start:'top top',end:function(){return '+='+dist();},pin:true,scrub:.7,anticipatePin:1,invalidateOnRefresh:true}});
    tl.to(track,{x:function(){return -dist();}},0).to('.svc-prog i',{scaleX:1},0);
  });
  mm.add('(max-width:980px)',function(){
    $$('.svc-card').forEach(function(c){
      gsap.set(c,{opacity:0,y:34});
      ScrollTrigger.create({trigger:c,start:'top 90%',once:true,onEnter:function(){gsap.to(c,{opacity:1,y:0,duration:.9,ease:'power3.out'});}});
    });
    gsap.set('.svc-prog i',{scaleX:1});
  });

  /* ---- process chart ---- */
  buildChart(false);

  /* ---- counters ---- */
  $$('[data-count]').forEach(function(el){
    var end=+el.dataset.count,suf=el.dataset.suffix||'',o={v:0};
    el.textContent='0'+suf;
    ScrollTrigger.create({trigger:el,start:'top 92%',once:true,onEnter:function(){
      gsap.to(o,{v:end,duration:1.8,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(o.v)+suf;}});
    }});
  });

  /* ---- mega CTA text fill ---- */
  $$('.mega .ln').forEach(function(el){
    gsap.fromTo(el,{backgroundSize:'0% 100%'},{backgroundSize:'100% 100%',ease:'none',scrollTrigger:{trigger:el,start:'top 88%',end:'top 48%',scrub:true}});
  });

  window.addEventListener('load',function(){ScrollTrigger.refresh();});

  /* ---- chart builder (shared by normal + reduced-motion paths) ---- */
  function buildChart(staticMode){
    var line=$('#chartLine'),nodesG=$('#nodes'),arrow=$('#chartArrow');
    if(!line)return;
    var L=line.getTotalLength(),NS='http://www.w3.org/2000/svg',fr=[.125,.375,.625,.875];
    var nodes=[],rings=[],steps=$$('.step');
    fr.forEach(function(f){
      var p=line.getPointAtLength(L*f);
      var ring=document.createElementNS(NS,'circle');ring.setAttribute('class','ring');ring.setAttribute('r','8');ring.setAttribute('cx',p.x);ring.setAttribute('cy',p.y);
      var c=document.createElementNS(NS,'circle');c.setAttribute('class','node');c.setAttribute('r','8');c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);
      nodesG.appendChild(ring);nodesG.appendChild(c);rings.push(ring);nodes.push(c);
    });
    line.style.strokeDasharray=L;
    function set(p){
      line.style.strokeDashoffset=L*(1-p);
      var a=line.getPointAtLength(L*p),b=line.getPointAtLength(Math.min(L,L*p+2));
      arrow.setAttribute('transform','translate('+a.x+' '+a.y+') rotate('+(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI)+')');
      fr.forEach(function(f,i){
        var on=p>=f-.02;
        nodes[i].classList.toggle('on',on);rings[i].classList.toggle('on',on);steps[i].classList.toggle('on',on);
      });
    }
    if(staticMode){set(1);return;}
    set(0);
    ScrollTrigger.create({trigger:'.chart-wrap',start:'top 75%',end:'bottom 58%',scrub:.5,onUpdate:function(self){set(self.progress);}});
  }
})();
