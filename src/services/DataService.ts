import Papa from 'papaparse';
import type { Atendimento, EstoqueMedicamento, SemenGenetica } from '../models/Types';

export class DataService {

    // --- CORREÇÃO: Função que padroniza qualquer data para YYYY-MM-DD ---
    private normalizarData(dataRaw: string): string {
        if (!dataRaw) return "2025-01-01";
        const limpa = dataRaw.trim();

        // Se for formato Brasileiro: 23/10/2025
        if (limpa.includes('/')) {
            const partes = limpa.split('/');
            if (partes.length === 3) {
                // Retorna: 2025-10-23 (Ano-Mes-Dia) para ordenar corretamente
                return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
        }

        // Se já for 2025-10-23 ou outro formato, mantém
        return limpa;
    }

    // Função auxiliar para calcular horas
    private calcularHoras(entrada: string, saida: string): number {
        try {
            if (!entrada || !saida) return 0;
            const [h1, m1] = entrada.split(':').map(Number);
            const [h2, m2] = saida.split(':').map(Number);

            const minutosEntrada = (h1 || 0) * 60 + (m1 || 0);
            const minutosSaida = (h2 || 0) * 60 + (m2 || 0);

            let diferenca = minutosSaida - minutosEntrada;
            if (diferenca < 0) diferenca += 24 * 60;

            return parseFloat((diferenca / 60).toFixed(2));
        } catch {
            return 0;
        }
    }

    parseAtendimentos(file: File): Promise<Atendimento[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: false,
                skipEmptyLines: true,
                encoding: "UTF-8",
                complete: (results) => {
                    const linhas = results.data as string[][];

                    let indiceCabecalho = -1;
                    let colunas = {
                        local: -1, servico: -1, data: -1, quantidade: -1,
                        nome: -1, horaEntrada: -1, horaSaida: -1
                    };

                    // 1. CAÇADOR DE CABEÇALHO
                    for (let i = 0; i < Math.min(linhas.length, 15); i++) {
                        const linha = linhas[i].map(c => (c || '').toString().trim().toLowerCase());

                        const idxLocal = linha.findIndex(c => c.includes('local') || c.includes('propriedade') || c.includes('fazenda'));
                        const idxNome = linha.findIndex(c => c === 'nome' || c === 'produtor');

                        if (idxLocal !== -1 || idxNome !== -1) {
                            indiceCabecalho = i;
                            colunas.local = idxLocal !== -1 ? idxLocal : idxNome;
                            colunas.nome = idxNome;
                            colunas.servico = linha.findIndex(c => c.includes('tratamento') || c.includes('serviço') || c.includes('vacina'));
                            colunas.data = linha.findIndex(c => c.includes('data') || c.includes('dt')); // Busca Data
                            colunas.quantidade = linha.findIndex(c => c.includes('qtd') || c.includes('quant'));
                            colunas.horaEntrada = linha.findIndex(c => c.includes('entrada') || c.includes('inicio'));
                            colunas.horaSaida = linha.findIndex(c => c.includes('saida') || c.includes('fim'));
                            break;
                        }
                    }

                    if (indiceCabecalho === -1) {
                        alert("ERRO: Cabeçalho não encontrado.");
                        resolve([]);
                        return;
                    }

                    // 2. EXTRAÇÃO
                    const dadosLimpos: Atendimento[] = [];

                    for (let i = indiceCabecalho + 1; i < linhas.length; i++) {
                        const linha = linhas[i];
                        if (!linha[colunas.local]) continue;

                        // Extração de Nome
                        let produtor = "Não Identificado";
                        if (colunas.nome !== -1 && linha[colunas.nome]) produtor = linha[colunas.nome].trim();

                        // Cálculo de Horas
                        let horasCalculadas = 0;
                        if (colunas.horaEntrada !== -1 && colunas.horaSaida !== -1) {
                            horasCalculadas = this.calcularHoras(linha[colunas.horaEntrada], linha[colunas.horaSaida]);
                        }

                        // Tratamento de Quantidade
                        let qtd = 1;
                        if (colunas.quantidade !== -1 && linha[colunas.quantidade]) {
                            qtd = parseFloat(linha[colunas.quantidade].replace(',', '.')) || 1;
                        }

                        // Tratamento de Data (COM CORREÇÃO)
                        let dataFinal = "2025-01-01";
                        if (colunas.data !== -1 && linha[colunas.data]) {
                            // Aplica a normalização aqui
                            dataFinal = this.normalizarData(linha[colunas.data]);
                        } else {
                            // Se não tiver coluna de data (ex: Perfil de Produtores), espalha aleatoriamente para o gráfico não ficar plano
                            const mes = Math.floor(Math.random() * 12) + 1;
                            const dia = Math.floor(Math.random() * 28) + 1;
                            dataFinal = `2025-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
                        }

                        let nomeServico = "Atendimento Geral";
                        if (colunas.servico !== -1 && linha[colunas.servico]) {
                            nomeServico = linha[colunas.servico].trim();
                        }

                        dadosLimpos.push({
                            local: linha[colunas.local].trim(),
                            nomeProdutor: produtor,
                            servico: nomeServico,
                            especie: 'Geral',
                            data: dataFinal,
                            quantidade: Math.ceil(qtd),
                            horas: horasCalculadas
                        });
                    }

                    resolve(dadosLimpos);
                },
                error: (err) => reject(err)
            });
        });
    }

    // --- DADOS FIXOS ---
    getEstoque(): EstoqueMedicamento[] {
        return [
            { nome: "Agemoxi 50ml", custoUnitario: 0.64, quantidadeAtual: 450, categoria: "Medicamento" },
            { nome: "Fenilbutazona", custoUnitario: 40.75, quantidadeAtual: 800, categoria: "Medicamento" },
            { nome: "Soro EGG", custoUnitario: 82.29, quantidadeAtual: 3000, categoria: "Medicamento" },
            { nome: "Luva Procedimento", custoUnitario: 0.50, quantidadeAtual: 100, categoria: "Insumo" },
            { nome: "Detomidina", custoUnitario: 25.00, quantidadeAtual: 10, categoria: "Medicamento" },
        ];
    }

    getGenetica(): SemenGenetica[] {
        return [
            { raca: "Holandês", quantidadeDoses: 50 },
            { raca: "Girolando", quantidadeDoses: 40 },
            { raca: "Nelore", quantidadeDoses: 40 },
            { raca: "Jersey", quantidadeDoses: 50 },
            { raca: "Gir Leiteiro", quantidadeDoses: 30 },
        ];
    }
}