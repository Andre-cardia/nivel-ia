# Analytics — referência visual e asset

Referência solicitada: https://mentoria.neuralhub.ia.br/brand, inspecionada no Chrome
em 2026-09-04. Tokens observados: #060606, #101010, #141414, #ff6a00,
#f5f2ea, #8b867c; Space Grotesk/Space Mono; grid técnico e bordas discretas.
No dashboard, texto auxiliar elevado a #b6b0a5 para legibilidade nas legendas pequenas.

Gráficos: uma raiz laranja e tons neutros; sem paleta multicolorida automática.
Comparações distinguem posição/rótulos e, no radar, linha sólida versus tracejada.
Datas indicam coleta; nenhuma série temporal é interpretada como aprendizado.
Antes/depois usa aplicações vinculadas e amostras independentes, sem identificar pessoas.

## Hero

- Asset: `public/images/analytics-neural-core.jpg` (1536×1024, cerca de 384 KiB).
- Gerado com a ferramenta integrada `image_gen`, sem CLI/API externa.
- Original preservado no diretório de imagens geradas; cópia JPEG otimizada no projeto.
- Usado somente como imagem decorativa com `alt=""`, recorte CSS e proteção de contraste
  no hero. Não é uma representação de dados e não aparece atrás dos gráficos.

### Prompt utilizado

Use case: stylized-concept. Asset type: wide dashboard hero background for Neural Hub
AI training diagnostics. Create an epic, cinematic macro landscape of a monumental
dark obsidian neural core / sculptural orbital ring, fine illuminated orange #ff6a00
circuit filaments suggesting knowledge connections, on almost pure black #060606.
Editorial, restrained, premium technical aesthetic, realistic material, dramatic side
lighting, subtle fine grain. Composition: landscape 3:2, sculpture concentrated on right
half, left half very dark clean negative space for UI title; subject remains legible
when cropped into a short wide dashboard banner. Palette STRICTLY black, charcoal,
orange and subtle warm ivory glints. No blue, purple, pink or rainbow. No text, no logos,
no people, no charts, no UI, no watermark. This is a decorative atmosphere only, not
data visualization.

## Verificação de SQL reproduzível

Instalar `@electric-sql/pglite` em diretório temporário fora do projeto (não há nova
dependência de produção), então executar:

```sh
node tests/verify-rounds-sql.mjs /caminho/temporario/node_modules/@electric-sql/pglite/dist/index.js
```

O script cria PostgreSQL em memória e funções `auth` de teste. Verifica SQL real das
migrações v11 e v10, permissões, vínculo, idempotência, unicidade e preservação das
respostas. Não valida o ambiente Supabase hospedado, a API PostgREST ou JWTs reais.
Referência da ferramenta: https://pglite.dev/docs/
