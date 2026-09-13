# Contribuição

- Preserve as dependências da Clean Architecture: domínio → aplicação → adapters.
- Adapters externos implementam interfaces em `application/ports`.
- Não leia variáveis de ambiente fora de `server/config`.
- Não exponha chaves, prompts internos ou reasoning no cliente.
- Toda nota deve pertencer à escala `0 | 40 | 80 | 120 | 160 | 200`.
- Valide respostas externas antes de entregá-las à apresentação.
- Teste regras determinísticas de domínio sem rede.
