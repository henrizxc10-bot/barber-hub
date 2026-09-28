# Barber Hub

CRIAÇÃO DE PLATAFORMA SAAS COMPLETA PARA BARBEARIA



Você é um desenvolvedor full-stack sênior, especialista em UX/UI, sistemas de agendamento, e-commerce, automações e aplicações SaaS.



Crie uma aplicação web responsiva, moderna e pronta para produção para uma barbearia chamada [NOME DA BARBEARIA].



O sistema deve funcionar como uma plataforma integrada de:



1. Atendimento ao cliente

2. Agendamento de serviços

3. Gestão de barbeiros

4. Gestão de clientes

5. Loja virtual de produtos

6. Carrinho e checkout

7. Pagamentos

8. Notificações e lembretes

9. Programa de fidelidade

10. Dashboard administrativo

11. Gestão financeira

12. Automação de atendimento

13. Relatórios

14. CRM da barbearia



IMPORTANTE:



Não criar apenas uma landing page.



Construir uma aplicação funcional, navegável e estruturada para posterior conexão com banco de dados, autenticação, pagamentos, WhatsApp e serviços externos.



---



1. OBJETIVO DO PRODUTO



Criar um aplicativo que permita ao cliente resolver praticamente tudo sozinho:



- conhecer a barbearia;

- visualizar serviços;

- consultar preços;

- escolher barbeiro;

- consultar horários disponíveis;

- agendar atendimento;

- remarcar atendimento;

- cancelar atendimento;

- receber confirmação;

- receber lembrete;

- visualizar histórico;

- comprar produtos;

- acompanhar pedidos;

- acumular pontos;

- utilizar cupons;

- conversar com atendimento automatizado.



No lado administrativo, a barbearia deve conseguir:



- controlar agenda;

- cadastrar barbeiros;

- cadastrar serviços;

- cadastrar produtos;

- administrar pedidos;

- administrar clientes;

- acompanhar faturamento;

- criar cupons;

- controlar estoque;

- acompanhar métricas;

- visualizar calendário;

- configurar horários de funcionamento;

- configurar feriados e bloqueios;

- acompanhar avaliações;

- gerenciar campanhas.



---



2. IDENTIDADE VISUAL



Criar uma identidade visual premium inspirada em barbearias modernas.



Estética:



- masculina;

- sofisticada;

- premium;

- minimalista;

- urbana;

- elegante.



Paleta sugerida:



- Preto: #0B0B0B

- Preto secundário: #151515

- Branco: #F5F5F5

- Dourado: #C8A45D

- Cinza: #888888

- Verde para status positivo: #22C55E

- Vermelho para alertas: #EF4444



Utilizar bastante espaço negativo.



Tipografia moderna e elegante.



Interface com aparência de produto SaaS premium.



Não utilizar excesso de gradientes.



Utilizar cards, sombras sutis, bordas arredondadas e microinterações.



A interface deve funcionar perfeitamente em:



- desktop;

- tablet;

- smartphone.



Prioridade máxima para experiência mobile.



---



3. ARQUITETURA DA APLICAÇÃO



Estruturar a aplicação em módulos.



Área pública



Rotas:



/



/servicos



/barbeiros



/agendamento



/loja



/produto/:id



/carrinho



/checkout



/login



/cadastro



/contato



/politica-privacidade



/termos



Área do cliente



/dashboard



/dashboard/agendamentos



/dashboard/agendamentos/:id



/dashboard/pedidos



/dashboard/pedidos/:id



/dashboard/perfil



/dashboard/fidelidade



/dashboard/cupons



/dashboard/notificacoes



Área administrativa



/admin



/admin/dashboard



/admin/agenda



/admin/agendamentos



/admin/clientes



/admin/barbeiros



/admin/servicos



/admin/produtos



/admin/categorias



/admin/pedidos



/admin/estoque



/admin/cupons



/admin/fidelidade



/admin/financeiro



/admin/relatorios



/admin/avaliacoes



/admin/configuracoes



/admin/notificacoes



---



4. LANDING PAGE



Criar uma página inicial extremamente profissional.



Hero:



Título:



"Seu estilo. Seu horário. Seu lugar."



Subtítulo:



"Agende seu atendimento, escolha seu barbeiro e compre seus produtos favoritos em poucos cliques."



CTAs:



"Agendar agora"



"Conhecer a loja"



Adicionar imagem ou composição visual premium relacionada a barbearia.



---



Seção de serviços



Exibir cards para:



- Corte masculino

- Barba

- Corte + Barba

- Degradê

- Sobrancelha

- Pigmentação

- Platinado

- Outros serviços configuráveis



Cada card deve mostrar:



- imagem;

- nome;

- descrição;

- duração;

- preço;

- botão "Agendar".



---



5. SISTEMA DE AGENDAMENTO



Criar um fluxo de agendamento em etapas.



Etapa 1



Escolher serviço.



Etapa 2



Escolher barbeiro.



Opção:



"Qualquer barbeiro disponível"



Etapa 3



Escolher data.



Mostrar calendário.



Etapa 4



Mostrar somente horários realmente disponíveis.



Exemplo:



09:00

09:30

10:00

10:30

11:00

14:00

14:30



Horários indisponíveis devem ficar bloqueados.



Etapa 5



Confirmar dados.



Mostrar:



- serviço;

- barbeiro;

- data;

- horário;

- duração;

- preço.



Etapa 6



Confirmação.



Mostrar número do agendamento.



---



6. REGRAS DO AGENDAMENTO



O sistema deve considerar:



- horário de funcionamento;

- intervalo entre atendimentos;

- duração do serviço;

- disponibilidade do barbeiro;

- férias;

- folgas;

- feriados;

- bloqueios manuais;

- agendamentos existentes;

- limite de antecedência;

- política de cancelamento.



Impedir automaticamente:



- conflito de horários;

- dupla reserva;

- agendamento fora do expediente.



Criar status:



- aguardando;

- confirmado;

- em atendimento;

- concluído;

- cancelado;

- não compareceu.



---



7. PERFIL DO BARBEIRO



Cada barbeiro possui:



- nome;

- foto;

- descrição;

- especialidades;

- serviços;

- avaliação;

- horários de trabalho;

- dias de folga;

- status ativo/inativo.



Página pública do barbeiro:



"Conheça seu barbeiro"



Mostrar avaliações e serviços realizados.



---



8. ÁREA DO CLIENTE



Criar dashboard pessoal.



Mostrar:



"Olá, [nome]"



Cards:



- próximo agendamento;

- pontos;

- pedidos recentes;

- cupons disponíveis.



Menu:



- Início

- Meus agendamentos

- Meus pedidos

- Fidelidade

- Cupons

- Notificações

- Perfil

- Sair



---



9. CRM DE CLIENTES



No painel administrativo, criar cadastro completo.



Campos:



- nome;

- telefone;

- e-mail;

- data de nascimento;

- CPF opcional;

- endereço;

- data do cadastro;

- último atendimento;

- total gasto;

- quantidade de visitas;

- barbeiro preferido;

- serviços preferidos;

- produtos comprados;

- observações;

- pontos de fidelidade.



Criar histórico completo do cliente.



---



10. SISTEMA DE LOJA ONLINE



Criar uma loja virtual integrada ao aplicativo.



Categorias:



- Pomadas

- Ceras

- Shampoos

- Óleos para barba

- Balm

- Pentes

- Escovas

- Máquinas

- Navalhas

- Kits

- Outros



Cada produto deve possuir:



- nome;

- SKU;

- descrição;

- preço;

- preço promocional;

- imagens;

- categoria;

- estoque;

- estoque mínimo;

- peso;

- dimensões;

- status;

- produtos relacionados.



---



11. PÁGINA DE PRODUTO



Mostrar:



- galeria de imagens;

- nome;

- preço;

- desconto;

- parcelamento;

- disponibilidade;

- descrição;

- especificações;

- quantidade;

- botão "Adicionar ao carrinho".



Adicionar:



"Você também pode gostar"



com produtos relacionados.



---



12. CARRINHO



O carrinho deve permitir:



- adicionar;

- remover;

- alterar quantidade;

- visualizar subtotal;

- aplicar cupom;

- calcular frete;

- visualizar total.



Mostrar resumo:



Produtos

Frete

Desconto

Total



Botão:



"Finalizar compra"



---



13. CHECKOUT



Criar checkout simplificado.



Dados:



- nome;

- telefone;

- e-mail;

- endereço;

- número;

- complemento;

- bairro;

- cidade;

- estado;

- CEP.



Métodos de pagamento preparados para integração:



- PIX;

- cartão de crédito;

- cartão de débito.



Estruturar o sistema para integração com gateway de pagamento.



Não armazenar dados sensíveis de cartão diretamente na aplicação.



---



14. PEDIDOS



Criar página de pedidos.



Status:



- aguardando pagamento;

- pagamento aprovado;

- preparando pedido;

- enviado;

- entregue;

- cancelado.



Mostrar timeline do pedido.



Cada pedido deve possuir:



- número;

- data;

- produtos;

- quantidade;

- subtotal;

- desconto;

- frete;

- total;

- endereço;

- pagamento;

- status.



---



15. ESTOQUE



Criar gerenciamento de estoque.



Funções:



- entrada;

- saída;

- ajuste;

- estoque atual;

- estoque mínimo;

- alerta de estoque baixo.



Quando um pedido for confirmado:



diminuir estoque automaticamente.



Quando o pedido for cancelado:



restaurar estoque quando aplicável.



Criar alertas administrativos:



"Produto com estoque baixo"



---



16. PROGRAMA DE FIDELIDADE



Criar sistema de pontos.



Exemplo configurável:



A cada R$ 1 gasto = X pontos.



Permitir:



- ganhar pontos;

- consultar saldo;

- trocar pontos;

- histórico de pontos.



Criar níveis:



Bronze

Prata

Ouro

Black



Os nomes e regras devem ser configuráveis pelo administrador.



---



17. CUPONS



Criar sistema de cupons.



Tipos:



- percentual;

- valor fixo;

- frete grátis;

- primeira compra;

- aniversário;

- cliente inativo;

- campanha específica.



Configurações:



- código;

- desconto;

- validade;

- quantidade máxima;

- valor mínimo;

- produtos aplicáveis;

- categorias aplicáveis;

- limite por cliente.



---



18. SISTEMA DE AVALIAÇÕES



Após atendimento concluído:



enviar convite para avaliação.



Cliente pode avaliar:



- nota de 1 a 5;

- comentário.



Mostrar avaliações na página do barbeiro.



Administrador pode moderar avaliações.



---



19. ATENDIMENTO AUTOMATIZADO



Criar uma interface de chat dentro do aplicativo.



O assistente deve conseguir responder perguntas relacionadas a:



- horários;

- serviços;

- preços;

- barbeiros;

- disponibilidade;

- endereço;

- funcionamento;

- produtos;

- pedidos;

- agendamento.



Criar respostas rápidas:



"Quero agendar"



"Ver serviços"



"Ver preços"



"Falar com atendente"



"Ver meu pedido"



"Comprar produtos"



O sistema deve encaminhar para atendimento humano quando necessário.



Estruturar o módulo para futura integração com WhatsApp Business e APIs de automação.



---



20. AUTOMAÇÕES



Criar estrutura para automações.



Agendamento confirmado



Enviar:



"Seu horário foi confirmado."



Lembrete



Enviar automaticamente antes do atendimento.



Tempo configurável pelo administrador.



Pós-atendimento



Enviar mensagem solicitando avaliação.



Cliente inativo



Identificar clientes sem atendimento há determinado período.



Permitir criação de campanhas.



Aniversário



Enviar mensagem automática no aniversário.



Pedido aprovado



Enviar confirmação.



Pedido enviado



Enviar atualização.



---



21. PAINEL ADMINISTRATIVO



Criar dashboard completo.



Cards principais:



- faturamento do dia;

- faturamento do mês;

- agendamentos hoje;

- atendimentos concluídos;

- novos clientes;

- pedidos da loja;

- ticket médio;

- produtos vendidos.



Gráficos:



- faturamento por período;

- agendamentos;

- serviços mais vendidos;

- produtos mais vendidos;

- clientes novos;

- taxa de retorno;

- desempenho dos barbeiros.



---



22. CALENDÁRIO ADMINISTRATIVO



Criar calendário visual.



Visualizações:



- dia;

- semana;

- mês.



Cada agendamento deve mostrar:



- horário;

- cliente;

- serviço;

- barbeiro;

- status.



Permitir:



- criar agendamento;

- editar;

- cancelar;

- remarcar;

- bloquear horário.



Utilizar cores diferentes para status.



---



23. GESTÃO DE SERVIÇOS



Administrador pode:



- criar;

- editar;

- excluir;

- ativar;

- desativar.



Campos:



- nome;

- descrição;

- preço;

- duração;

- imagem;

- barbeiros habilitados;

- categoria.



---



24. CONFIGURAÇÕES DA BARBEARIA



Criar painel de configurações.



Informações:



- nome;

- logo;

- endereço;

- telefone;

- WhatsApp;

- Instagram;

- horário de funcionamento;

- intervalo entre atendimentos;

- política de cancelamento;

- tempo mínimo para agendamento;

- tempo máximo para agendamento;

- moeda;

- fuso horário.



---



25. BANCO DE DADOS



Estruturar o banco para conter, no mínimo:



users

customers

barbers

services

barber_services

appointments

appointment_status_history

business_hours

blocked_times

holidays

products

product_categories

inventory

inventory_movements

orders

order_items

payments

addresses

coupons

coupon_usages

loyalty_accounts

loyalty_transactions

reviews

notifications

conversations

messages

settings



Criar relacionamentos corretamente.



Utilizar IDs únicos.



Criar timestamps:



created_at

updated_at



Sempre que necessário.



---



26. AUTENTICAÇÃO E PERMISSÕES



Criar autenticação segura.



Tipos de usuário:



CUSTOMER

BARBER

ADMIN



Permissões:



CUSTOMER:



- visualizar própria conta;

- criar agendamento;

- visualizar próprios pedidos;

- comprar;

- visualizar pontos.



BARBER:



- visualizar própria agenda;

- visualizar seus atendimentos;

- atualizar status dos atendimentos;

- visualizar informações necessárias dos clientes.



ADMIN:



- acesso total.



Implementar proteção das rotas administrativas.



---



27. RESPONSIVIDADE



O sistema deve ser mobile-first.



No celular:



- menu inferior ou menu compacto;

- botões grandes;

- calendário adaptado;

- checkout simplificado;

- cards empilhados;

- navegação fácil com uma mão.



No desktop:



- sidebar administrativa;

- dashboards em grid;

- tabelas completas;

- calendário amplo.



---



28. UX



Priorizar redução de cliques.



O usuário deve conseguir chegar ao agendamento rapidamente.



CTA principal:



"AGENDAR AGORA"



Usar feedback visual para:



- carregamento;

- sucesso;

- erro;

- confirmação;

- estoque;

- pagamento.



Criar estados:



- loading;

- empty;

- error;

- success.



Nunca deixar uma tela quebrada ou vazia sem explicação.



---



29. COMPONENTES REUTILIZÁVEIS



Criar componentes reutilizáveis:



Button

Card

Modal

Dialog

Input

Select

Calendar

DatePicker

TimeSlot

ServiceCard

BarberCard

ProductCard

CartDrawer

CheckoutForm

AppointmentCard

OrderCard

StatusBadge

DashboardCard

DataTable

Toast

Notification

ChatWidget



Manter padrão visual consistente.



---



30. SEGURANÇA



Implementar:



- autenticação;

- autorização por função;

- validação de formulários;

- proteção das rotas;

- validação dos dados recebidos;

- regras de acesso ao banco;

- tratamento de erros;

- proteção contra manipulação de preços no frontend.



Valores financeiros devem ser validados no backend.



O preço final do pedido deve ser calculado no servidor/backend.



Nunca confiar exclusivamente nos valores enviados pelo navegador.



---



31. PAGAMENTOS



Preparar arquitetura para integração com gateway de pagamento.



O fluxo deve ser:



Cliente

→ Checkout

→ Backend

→ Gateway

→ Webhook

→ Atualização do pedido



Criar estrutura para:



payment_status



- pending

- approved

- declined

- refunded

- cancelled



Não considerar pedido pago apenas porque o frontend informou pagamento aprovado.



---



32. NOTIFICAÇÕES



Criar sistema interno de notificações.



Tipos:



- novo agendamento;

- alteração de horário;

- cancelamento;

- lembrete;

- pagamento aprovado;

- pedido enviado;

- estoque baixo;

- avaliação.



Criar tabela de notificações.



Permitir marcar como lida.



---



33. BUSCA



Criar pesquisa global na loja.



Pesquisar por:



- nome;

- categoria;

- SKU.



Adicionar filtros:



- preço;

- categoria;

- disponibilidade;

- promoção.



---



34. SEO



Configurar:



- title;

- meta description;

- Open Graph;

- URLs amigáveis;

- sitemap;

- robots.txt;

- schema markup quando aplicável.



Criar páginas indexáveis para serviços e produtos.



---



35. PERFORMANCE



Priorizar:



- carregamento rápido;

- lazy loading;

- imagens otimizadas;

- componentes reutilizáveis;

- consultas eficientes;

- paginação;

- cache quando aplicável.



---



36. DADOS DEMONSTRATIVOS



Criar dados fictícios para demonstração:



5 barbeiros.



10 serviços.



20 produtos.



10 clientes.



10 agendamentos.



10 pedidos.



Isso permitirá testar o sistema imediatamente.



Deixar todos os dados claramente identificados como dados de demonstração.



---



37. DASHBOARD INICIAL



Ao entrar no admin, mostrar:



"Bom dia, [nome]"



"Resumo da sua barbearia"



Cards:



Faturamento hoje

Agendamentos hoje

Clientes novos

Pedidos

Ticket médio



Depois:



Agenda de hoje



Pedidos recentes



Produtos com estoque baixo



Clientes recentes



---



38. EXPERIÊNCIA DO CLIENTE



Fluxo ideal:



HOME

↓

AGENDAR

↓

SERVIÇO

↓

BARBEIRO

↓

DATA

↓

HORÁRIO

↓

LOGIN/CADASTRO

↓

CONFIRMAÇÃO

↓

LEMBRETE

↓

ATENDIMENTO

↓

AVALIAÇÃO

↓

FIDELIDADE



Fluxo de compra:



HOME

↓

LOJA

↓

PRODUTO

↓

CARRINHO

↓

CHECKOUT

↓

PAGAMENTO

↓

PEDIDO

↓

ACOMPANHAMENTO



---



39. INTEGRAÇÕES FUTURAS



Estruturar o projeto para permitir integração posterior com:



- Supabase;

- Mercado Pago;

- Stripe;

- WhatsApp Business API;

- APIs de envio;

- serviços de e-mail;

- Google Calendar;

- ferramentas de analytics.



Não criar integrações falsas.



Quando uma integração externa ainda não estiver configurada, criar uma camada de serviço/mock claramente separada para facilitar a substituição posteriormente.



---



40. TRATAMENTO DE ERROS



Criar mensagens amigáveis.



Exemplo:



"Não conseguimos concluir o agendamento. Atualize a página e tente novamente."



Nunca mostrar erros técnicos diretamente ao cliente.



No painel administrativo, registrar erros relevantes para diagnóstico.



---



41. DESIGN DO ADMIN



Sidebar escura.



Logo no topo.



Menu:



Dashboard

Agenda

Agendamentos

Clientes

Barbeiros

Serviços

Loja

Produtos

Estoque

Pedidos

Cupons

Fidelidade

Avaliações

Financeiro

Relatórios

Notificações

Configurações



Sidebar deve ser responsiva.



---



42. LOJA — EXPERIÊNCIA VISUAL



Criar:



Banner principal.



Categorias horizontais.



Produtos em grid.



Badge:



"NOVO"



"PROMOÇÃO"



"MAIS VENDIDO"



Cards com:



imagem;

nome;

preço;

preço promocional;

avaliação;

botão comprar.



Adicionar carrinho lateral.



---



43. MICROINTERAÇÕES



Adicionar animações discretas:



- hover;

- fade;

- slide;

- feedback ao adicionar produto;

- confirmação de agendamento;

- transições entre etapas.



Evitar animações exageradas.



---



44. ACESSIBILIDADE



Garantir:



- contraste adequado;

- labels nos inputs;

- navegação por teclado;

- foco visível;

- botões acessíveis;

- mensagens de erro claras;

- suporte básico a leitores de tela.



---



45. ESTRUTURA TÉCNICA



Utilizar arquitetura moderna e modular.



Separar:



UI

Components

Pages

Services

Hooks

Types

Database

Authentication

Business Logic



Não colocar regras complexas diretamente nos componentes visuais.



Centralizar regras de negócio.



---



46. REGRA CRÍTICA DO AGENDAMENTO



A disponibilidade deve ser calculada dinamicamente.



Exemplo:



Barbeiro trabalha:



09:00 — 18:00



Serviço possui duração:



60 minutos



Se já existe atendimento:



10:00 — 11:00



Não permitir:



09:30 — 10:30



nem:



10:30 — 11:30



caso exista conflito.



Considerar também intervalo configurado.



---



47. REGRA CRÍTICA DA LOJA



Nunca confiar no preço enviado pelo cliente.



Ao finalizar pedido:



1. buscar produto;

2. verificar existência;

3. verificar estoque;

4. obter preço oficial;

5. validar cupom;

6. calcular desconto;

7. calcular frete;

8. calcular total;

9. criar pedido;

10. iniciar pagamento.



---



48. ADMINISTRADOR DEVE CONSEGUIR ALTERAR



Sem modificar código:



- preços;

- serviços;

- horários;

- barbeiros;

- produtos;

- estoque;

- cupons;

- regras de fidelidade;

- textos principais;

- contatos;

- endereço;

- redes sociais;

- configurações da barbearia.



---



49. RESULTADO ESPERADO



Entregar uma aplicação funcional e navegável.



Não criar telas apenas visualmente.



Todos os principais botões devem possuir comportamento funcional.



Criar estados de loading, erro e sucesso.



Criar navegação completa.



Criar banco/modelos necessários.



Criar autenticação e permissões.



Criar dados demonstrativos.



Preparar arquitetura para integrações externas.



---



50. CHECKLIST FINAL



Antes de considerar o projeto concluído, verificar:



[ ] Landing page funcional

[ ] Cadastro

[ ] Login

[ ] Recuperação de acesso

[ ] Área do cliente

[ ] Agendamento

[ ] Calendário

[ ] Disponibilidade

[ ] Barbeiros

[ ] Serviços

[ ] Loja

[ ] Produtos

[ ] Carrinho

[ ] Checkout

[ ] Pedidos

[ ] Estoque

[ ] Cupons

[ ] Fidelidade

[ ] Avaliações

[ ] Notificações

[ ] Chat

[ ] Dashboard

[ ] CRM

[ ] Relatórios

[ ] Configurações

[ ] Controle de permissões

[ ] Responsividade

[ ] Tratamento de erros

[ ] SEO

[ ] Acessibilidade



Não finalizar simplesmente porque as telas foram criadas.



Testar os principais fluxos da aplicação ponta a ponta e corrigir erros de navegação, estados, validação e responsividade encontrados.



O resultado deve parecer um produto SaaS profissional pronto para receber usuários reais, e não um protótipo estático.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/916f4571-a4fc-4968-bb3f-02d235330089).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
