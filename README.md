# Corretor Redacao AI — OCR e correção ENEM

Aplicação web para transcrever redações manuscritas e produzir uma correção estruturada nas cinco competências do ENEM.

## Modelos

- OCR PT-BR remoto: `gemini-3.1-flash-lite` faz a primeira leitura sem thinking. Abaixo de 88% de confiança, `gemini-3.5-flash` refina a transcrição, também sem thinking, preservando literalmente os erros do aluno.
- Recuperação semântica: `gemini-embedding-001` seleciona âncoras PT-BR da rubrica antes da correção. Não envia vetores ao navegador e não usa modelo local.
- Avaliação: `gemini-3.8-flash` com thinking alto e resposta JSON validada; retry e fallback `gemini-3.6-flash` absorvem picos de demanda.
- Todos ficam atrás de portas de aplicação; nenhum modelo roda localmente.

## Fluxo

1. Envio por seleção ou drag-and-drop de até cinco imagens.
2. OCR visual PT-BR remoto por Gemini sem reasoning.
3. Revisão humana da transcrição antes da avaliação.
4. Uma requisição unificada avalia C1–C5 e retorna JSON validado.
5. Opcional: auditoria executa três pareceres independentes, escolhe a mediana por competência e mostra concordância e faixa total.

## Executar

```bash
cp .env.example .env
# preencha GOOGLE_API_KEY no .env
npm install
npm run dev
```

Build de produção:

```bash
npm run check
npm start
```

O servidor tenta `PORT` e, se estiver ocupada, escolhe automaticamente uma porta entre `PORT` e `PORT + 20`.

## Estrutura

```text
src/
├── server/
│   ├── application/       # casos de uso e interfaces dos provedores
│   ├── config/            # ambiente validado
│   ├── domain/            # regras, schemas e consenso
│   ├── infrastructure/    # adapters Google, modelos e conhecimento
│   └── presentation/http/ # Express, rotas e erros
├── shared/                # contratos compartilhados
└── web/                   # React, componentes, hooks e serviços
```

Dependências apontam para dentro: apresentação e infraestrutura implementam portas da aplicação; domínio não conhece HTTP, React ou Google.

## Confiabilidade

A confiança do OCR é uma estimativa visual do Gemini e deve ser confirmada na etapa de revisão humana. Para notas, um intervalo de confiança estatístico não seria defensável com apenas três respostas do mesmo modelo. A aplicação apresenta uma **faixa empírica de consenso** e a proporção de notas modais, com essa limitação explícita.

## Embeddings e knowledge graph

`gemini-embedding-001` recupera as quatro âncoras da rubrica mais próximas semanticamente da redação e do tema. Falha de embedding não bloqueia a correção. Knowledge graph não foi adicionado: a rubrica atual é pequena e estática; um grafo só passa a compensar quando houver acervo versionado de temas, repertórios e decisões humanas relacionadas.

## Segurança e privacidade

- `.env` é ignorado pelo Git; a chave nunca vai ao navegador.
- Uploads ficam em memória e não são persistidos.
- Tipos, quantidade e tamanho dos arquivos são limitados.
- Não use a nota como resultado oficial do INEP.
