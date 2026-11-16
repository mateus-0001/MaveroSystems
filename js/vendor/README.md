# Dependências de animação

GSAP e ScrollTrigger 3.12.5, a mesma versão usada anteriormente pelo site.
Os arquivos são distribuídos junto do site para as animações da página não dependerem de outra conexão com uma CDN.

Fontes dos arquivos, sem alterações:

- https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
- https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js

Os avisos de autoria e licença estão preservados no início dos arquivos.

## Three.js

Three.js 0.160.0 e os três módulos usados pelo logo foram copiados, sem alterações, do pacote oficial `three@0.160.0` do npm. O pacote usa licença MIT, preservada em `three-0.160.0/LICENSE`.

São publicados apenas o módulo principal minificado, `GLTFLoader`, `BufferGeometryUtils` e `RoomEnvironment`. O mapa de importações aponta para esses arquivos locais; o site não executa código do unpkg.

O build verifica os hashes SHA-256 dessas dependências e dos dois arquivos do GSAP contra `scripts/vendor-checksums.json`. Uma atualização intencional precisa revisar versões, licenças e hashes.
