# Doce Migalha — site de encomenda de bolos (PT-BR)

Projeto demonstrativo em HTML, CSS e JavaScript puro. Não requer etapa de build nem dependências.

## Como executar
- Extraia o arquivo ZIP.
- Abra `index.html` no navegador; para testar as rotas, recomenda-se servir a pasta com um servidor estático local.
- Página pública: `/`
- Painel administrativo: `/admin` (com o `vercel.json` incluído) ou `admin.html` em hospedagem estática sem reescrita.

## O que está incluído
- Site responsivo em português do Brasil.
- Cardápio e formulário de encomenda com validação, data mínima e estimativa em reais.
- Painel administrativo de demonstração com métricas, busca, filtro por status, detalhes do pedido, alteração de status, exportação JSON e limpeza dos dados.
- Gestão local de itens do cardápio: adicionar, editar e excluir.
- Botão para carregar pedidos de exemplo.

## Dados de demonstração
Os pedidos e os itens do cardápio são guardados no `localStorage` do navegador. O painel e o site precisam ser abertos no mesmo domínio/origem para compartilhar esses dados. Os pedidos iniciais são exemplos fictícios.

**Não existe backend, autenticação, envio de e-mail, integração de pagamento ou sincronização entre dispositivos.** Qualquer pessoa que acessar o painel pode visualizar e alterar os dados locais desse navegador. Não use este projeto para dados reais de clientes sem implementar backend, autenticação e controles de segurança.

## Publicar na Vercel
O `vercel.json` configura a rota amigável `/admin` para `admin.html`. Em outras hospedagens estáticas, acesse `/admin.html` diretamente ou configure uma regra de reescrita equivalente.
