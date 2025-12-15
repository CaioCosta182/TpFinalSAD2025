# 📊 SAD - Dashboard de Gestão Rural Jeceaba 2025

> **Sistema de Apoio à Decisão (SAD)** focado na visualização de dados para otimização de recursos veterinários e controle de fomento rural.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=white)

---

## 🎯 O Problema e a Solução

**O Contexto:**
O "Programa de Desenvolvimento Rural de Jeceaba" gera uma grande quantidade de dados sobre atendimentos veterinários, inseminações e uso de insumos. Atualmente, esses dados ficam dispersos em planilhas, dificultando a visão estratégica.

**O Problema de Decisão:**
O gestor não consegue responder rapidamente:
1.  Quais localidades demandam mais visitas (para otimizar rotas)?
2.  Há picos de atendimento em meses específicos (para planejar férias da equipe)?
3.  Existe dinheiro parado em estoque de insumos pouco usados?
4.  O perfil genético do rebanho está alinhado com a estratégia do município?

**A Solução:**
Este Dashboard centraliza os dados brutos (CSV), trata informações sensíveis (LGPD) e gera 4 visualizações interativas que respondem diretamente a essas perguntas.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React + TypeScript (Vite)
* **Estilização:** Tailwind CSS
* **Gráficos:** Recharts
* **Processamento de Dados:** PapaParse (Leitura de CSV no navegador)
* **Ícones:** Lucide React

---

## 🏛️ Arquitetura do Sistema (MVC Adaptado)

O projeto segue o padrão **Model-View-Controller** adaptado para o ecossistema React, garantindo separação de responsabilidades:

1.  **Model (`src/models` e `src/services`):**
    * Define a estrutura dos dados (`Types.ts`).
    * Responsável pela regra de negócio "pesada": ler o arquivo CSV, limpar sujeira, remover dados sensíveis (CPF) e normalizar os campos (`DataService.ts`).
2.  **View (`src/views`):**
    * Responsável apenas pela interface visual (`DashboardView.tsx`).
    * Não realiza cálculos complexos, apenas exibe os dados recebidos.
3.  **Controller (`src/controllers`):**
    * Faz a ponte entre o Model e a View (`useDashboardController.ts`).
    * Gerencia o estado da aplicação, aplica filtros (ex: filtrar por Localidade) e prepara os dados no formato exato que os gráficos exigem.

---

## 🧱 Aplicação dos Princípios SOLID

O código foi desenvolvido respeitando princípios de engenharia de software exigidos no trabalho:

### 1. SRP (Single Responsibility Principle)
*Cada classe/componente tem uma única responsabilidade.*
* **No Código:** O arquivo `DataService.ts` cuida exclusivamente do parsing e limpeza do CSV. Ele não sabe o que é um gráfico. O componente `DashboardView.tsx` cuida apenas de renderizar HTML/CSS. Se precisarmos mudar a cor de um gráfico, não corremos risco de quebrar a leitura do arquivo.

### 2. OCP (Open/Closed Principle)
*Aberto para extensão, fechado para modificação.*
* **No Código:** O `DataService` foi construído com um "caçador de colunas" inteligente. Se o layout da planilha do Excel mudar (ex: a coluna "Local" mudar para a coluna F), o sistema se adapta sem precisarmos reescrever o código do Controller ou da View. Novos tipos de gráficos podem ser adicionados na View sem alterar a lógica de leitura de dados.

### 3. DIP (Dependency Inversion Principle)
*Dependa de abstrações, não de implementações.*
* **No Código:** A View não importa diretamente o CSV. Ela depende das variáveis fornecidas pelo Controller (`atendimentos`, `estoque`, etc). Isso permite que, no futuro, troquemos a leitura de CSV por uma API Rest sem ter que mudar uma única linha de código na interface visual.

---

## 📊 Visualizações para Tomada de Decisão

1.  **Gráfico de Barras (Operacional):** Mostra o volume de atendimentos por localidade. Ajuda a decidir a alocação de veterinários e combustível.
2.  **Gráfico de Linha (Tático):** Mostra a evolução temporal. Permite prever sazonalidade e planejar escalas de trabalho.
3.  **Gráfico de Dispersão/Scatter (Financeiro):** Cruza `Quantidade em Estoque` x `Custo Unitário`. Ajuda a identificar capital parado (bolhas grandes no topo direito) ou risco de desabastecimento.
4.  **Gráfico de Pizza (Estratégico):** Mostra a distribuição de raças (genética). Apoia a decisão sobre quais tipos de sêmen comprar na próxima licitação.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* Node.js instalado (v16 ou superior).

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/sad-jeceaba-dashboard.git](https://github.com/seu-usuario/sad-jeceaba-dashboard.git)
    cd sad-jeceaba-dashboard
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Acesse:**
    Abra `http://localhost:5173` no seu navegador.

5.  **Teste o Sistema:**
    * O sistema abrirá "Vazio".
    * Clique no botão **"Carregar CSV"**.
    * Selecione o arquivo `Atendimentos.csv` (fornecido na pasta raiz ou gerado pelo Excel).
    * Os gráficos serão gerados automaticamente.

---

## 🔒 Segurança e Privacidade (LGPD)

O sistema conta com um módulo de anonimização no `DataService`. Mesmo que a planilha original contenha nomes completos, CPFs e Telefones dos produtores, o sistema **ignora** essas colunas durante a leitura, trazendo para a memória do navegador apenas dados agregados ou não sensíveis necessários para a tomada de decisão gerencial.

---

## 📂 Estrutura de Pastas

```text
src/
├── controllers/
│   └── useDashboardController.ts  # Lógica de controle e estado
├── models/
│   └── Types.ts                   # Interfaces TypeScript
├── services/
│   └── DataService.ts             # Leitura de CSV e Regras de Negócio
├── views/
│   └── DashboardView.tsx          # Interface Visual (Gráficos)
├── App.tsx                        # Componente Raiz
└── index.css                      # Estilos Globais (Tailwind)