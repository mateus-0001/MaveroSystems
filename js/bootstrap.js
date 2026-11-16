document.documentElement.classList.add('js');
/* Modo leve: decide ANTES de baixar o 3D. Aparelho/internet fraca = só o logo normal (e nada do 3D é baixado).
   Testes manuais: acrescente ?lite=1 (força modo leve) ou ?3d=1 (força o 3D) no fim do endereço. */
(function(){
  var W=window,N=navigator,D=document,root=D.documentElement,lite=false,why='';
  try{
    var q=location.search,c=N.connection||N.mozConnection||N.webkitConnection;
    if(W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches){lite=true;why='movimento-reduzido';}
    else if(/[?&]3d=1/.test(q)){try{localStorage.removeItem('mavero-lite')}catch(e){}}
    else if(/[?&]lite=1/.test(q)){lite=true;why='manual';}
    else{
      var mem=0;try{mem=+localStorage.getItem('mavero-lite')||0}catch(e){}
      if(mem&&Date.now()-mem<6048e5){lite=true;why='lembrado';}
      else if(c&&c.saveData){lite=true;why='economia-de-dados';}
      else if(c&&/^(slow-2g|2g|3g)$/.test(c.effectiveType||'')){lite=true;why='internet-lenta';}
      else if(N.deviceMemory&&N.deviceMemory<=2){lite=true;why='pouca-memoria';}
      else if(W.matchMedia&&W.matchMedia('(pointer:coarse)').matches&&N.hardwareConcurrency&&N.hardwareConcurrency<=4){lite=true;why='processador-fraco';}
      else{
        var cv=D.createElement('canvas'),gl=cv.getContext('webgl')||cv.getContext('experimental-webgl');
        if(!gl){lite=true;why='sem-webgl';}
        else{
          var ex=gl.getExtension('WEBGL_debug_renderer_info');
          if(ex&&/swiftshader|llvmpipe|softpipe|software/i.test(String(gl.getParameter(ex.UNMASKED_RENDERER_WEBGL)))){lite=true;why='sem-placa-de-video';}
          var lc=gl.getExtension('WEBGL_lose_context');if(lc)lc.loseContext();
        }
      }
    }
  }catch(e){}
  W.__maveroLite=lite;W.__maveroLiteWhy=why;
  if(lite){root.classList.add('no3d','lite3d');return;}
  /* aparelho bom: baixa os arquivos do 3D em paralelo */
  var U='js/vendor/three-0.160.0/';
  [U+'three.module.min.js',U+'addons/loaders/GLTFLoader.js',U+'addons/utils/BufferGeometryUtils.js',U+'addons/environments/RoomEnvironment.js','js/hero3d-core.js?v=4'].forEach(function(u){
    var l=D.createElement('link');l.rel='modulepreload';l.href=u;D.head.appendChild(l);
  });
  var g=D.createElement('link');g.rel='preload';g.as='fetch';g.href='assets/logo.glb?v=1';g.crossOrigin='anonymous';D.head.appendChild(g);
})();
