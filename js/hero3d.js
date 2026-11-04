/* Só carrega o 3D (Three.js + modelo) se o aparelho e a internet aguentarem. Veja o script no <head> do index.html. */
if(!window.__maveroLite){
  import('./hero3d-core.js?v=3').catch(function(e){
    console.warn('Mavero: 3D indisponível, usando o logo normal.',e);
    document.documentElement.classList.add('no3d');
    window.dispatchEvent(new Event('mavero:ready'));
  });
}
