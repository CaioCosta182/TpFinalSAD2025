// src/models/Types.ts

export interface Atendimento {
    local: string;
    servico: string; // Ex: Ultrassom, Vacina
    especie: string;
    data: string;
    quantidade: number;
}

export interface EstoqueMedicamento {
    nome: string;
    custoUnitario: number;
    quantidadeAtual: number;
    categoria: 'Insumo' | 'Medicamento';
}

export interface SemenGenetica {
    raca: string;
    quantidadeDoses: number;
}

// Filtros para o usuário
export interface DashboardFilters {
    localSelecionado: string | 'Todos';
}