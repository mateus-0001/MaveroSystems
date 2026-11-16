(function(){
  'use strict';
  var url=new URL(window.location.href);
  var spanish=url.searchParams.get('lang')==='es';
  var toggle=document.getElementById('languageToggle');
  if(!toggle)return;

  // A troca abre a página no idioma escolhido antes de iniciar as animações.
  // Os nós e elementos existentes são preservados, inclusive SVGs e contadores.
  if(spanish){
    document.documentElement.lang='es';
    var messages={
      'Serviços':'Servicios',
      'Processo':'Proceso',
      'Contato':'Contacto',
      'Iniciar projeto':'Iniciar proyecto',
      'Web design & desenvolvimento':'Diseño web y desarrollo',
      'Sob medida · Cada cliente é único':'A medida · Cada cliente es único',
      'Sites':'Sitios',
      'Um bom design':'Un buen diseño',
      'chama atenção':'llama la atención',
      '. Um site inteligente':'. Un sitio inteligente',
      'gera resultado':'genera resultados',
      '. Criamos plataformas rápidas e feitas sob medida para transformar visitantes em clientes.':'. Creamos plataformas rápidas y a medida para convertir visitantes en clientes.',
      'Iniciar meu projeto':'Iniciar mi proyecto',
      'ROLE PARA EXPLORAR • ROLE PARA EXPLORAR •':'DESLIZA PARA EXPLORAR • DESLIZA PARA EXPLORAR •',
      'Rolar para os serviços':'Ir a los servicios',
      'Não criamos só páginas bonitas.':'No solo creamos páginas bonitas.',
      'Construímos plataformas rápidas, adaptáveis e pensadas para o seu negócio crescer.':'Construimos plataformas rápidas, adaptables y pensadas para que tu negocio crezca.',
      'O que entregamos':'Qué ofrecemos',
      'Quatro camadas. Um site só.':'Cuatro capas. Un solo sitio.',
      'Design moderno':'Diseño moderno',
      'Identidade limpa, única e feita para deixar sua marca impossível de esquecer.':'Una identidad limpia, única y diseñada para que tu marca sea imposible de olvidar.',
      'Carregamento < 2s':'Carga < 2s',
      'Alta performance':'Alto rendimiento',
      'Código enxuto e carregamento rápido. Nada de enfeite pesando no seu resultado.':'Código ligero y carga rápida. Sin adornos que frenen tus resultados.',
      'Foco em conversão':'Enfoque en conversiones',
      'Estrutura e texto pensados para guiar quem chega até a próxima ação.':'Estructura y textos pensados para guiar al visitante hacia el siguiente paso.',
      '100% responsivo':'100% adaptable',
      'Experiência perfeita em qualquer tela, do celular ao desktop.':'Una experiencia fluida en cualquier pantalla, del celular a la computadora.',
      'Como funciona':'Cómo funciona',
      'Do zero ao resultado, sem fórmula pronta.':'De cero a los resultados, sin fórmulas prefabricadas.',
      'Diagnóstico':'Diagnóstico',
      'Entendemos seu negócio, seu público e o que trava sua presença online antes de desenhar qualquer tela.':'Entendemos tu negocio, tu público y lo que limita tu presencia online antes de diseñar cualquier pantalla.',
      'Direção visual':'Dirección visual',
      'Uma identidade e um layout únicos para a sua marca. Nada de template adaptado.':'Una identidad y un diseño únicos para tu marca. Sin plantillas adaptadas.',
      'Construção':'Desarrollo',
      'Desenvolvemos com foco em velocidade, responsividade e estrutura de conversão.':'Desarrollamos con foco en velocidad, adaptación a cada pantalla y conversión.',
      'Lançamento e evolução':'Lanzamiento y evolución',
      'Colocamos no ar e ajustamos o que for preciso para o site continuar performando.':'Publicamos el sitio y hacemos los ajustes necesarios para que siga rindiendo.',
      'Projetos entregues, contando este próprio site':'Proyectos entregados, incluido este sitio',
      'Projetos sob medida, sem template':'Proyectos a medida, sin plantillas',
      'Pacotes fixos. Cada proposta é única':'Paquetes fijos. Cada propuesta es única',
      'Meta de carregamento em cada entrega':'Objetivo de carga en cada entrega',
      'Vamos conversar':'Hablemos',
      'Vamos':'¿Vamos',
      'construir':'a crear',
      'o seu?':'el tuyo?',
      'O próximo passo para o crescimento da sua marca começa aqui. Conte sobre o seu projeto pelo WhatsApp e monte com a gente uma proposta pensada só para ele.':'El siguiente paso para que tu marca crezca empieza aquí. Cuéntanos tu proyecto por WhatsApp y preparemos juntos una propuesta pensada solo para él.',
      'Chamar no WhatsApp':'Escribir por WhatsApp'
    };
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      var node=walker.currentNode;
      if(node.parentElement.closest('script,style'))continue;
      var text=node.nodeValue.trim();
      if(Object.prototype.hasOwnProperty.call(messages,text)){
        node.nodeValue=node.nodeValue.replace(text,messages[text]);
      }
    }
    document.querySelectorAll('[aria-label]').forEach(function(el){
      var label=el.getAttribute('aria-label');
      if(Object.prototype.hasOwnProperty.call(messages,label))el.setAttribute('aria-label',messages[label]);
    });
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function(link){
      var contact=new URL(link.href);
      contact.searchParams.set('text','¡Hola! Vengo del sitio de Mavero Systems y quiero hablar sobre un proyecto.');
      link.href=contact.href;
    });
    document.title='Creación de sitios en Campina Grande | Mavero Systems';
    var metadata={
      'description':'Creación de sitios web y landing pages en Campina Grande, PB. Diseño a medida, adaptación al celular y contacto por WhatsApp. Conoce Mavero Systems.',
      'og:locale':'es_ES',
      'og:title':document.title,
      'og:description':'Sitios web y landing pages a medida para empresas y profesionales de Campina Grande, PB. Habla con Mavero Systems por WhatsApp.',
      'og:image:alt':'Mavero Systems — creación de sitios web y landing pages',
      'twitter:title':document.title,
      'twitter:description':'Sitios web y landing pages a medida para negocios de Campina Grande, PB. Diseño, adaptación a cada pantalla y contacto por WhatsApp.',
      'twitter:image:alt':'Mavero Systems — creación de sitios web y landing pages'
    };
    document.querySelectorAll('meta[name],meta[property]').forEach(function(meta){
      var key=meta.getAttribute('name')||meta.getAttribute('property');
      if(metadata[key])meta.content=metadata[key];
    });
    url.searchParams.delete('lang');
  }else{
    url.searchParams.set('lang','es');
  }
  toggle.textContent=spanish?'PT':'ES';
  toggle.lang=spanish?'pt-BR':'es';
  toggle.hreflang=toggle.lang;
  toggle.setAttribute('aria-label',spanish?'Ver sitio en portugués':'Ver site em espanhol');
  toggle.href=url.pathname+url.search+url.hash;
})();
