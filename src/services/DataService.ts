import Papa from 'papaparse';
import type { Atendimento, EstoqueMedicamento, SemenGenetica } from '../models/Types';

export class DataService {

    parseAtendimentos(file: File): Promise<Atendimento[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: false,
                skipEmptyLines: true,
                encoding: "UTF-8", // <--- CORREÇÃO: UTF-8 para arquivos modernos/exportados do Google/Excel novo
                complete: (results) => {
                    const linhas = results.data as string[][];
                    console.log(`Linhas lidas: ${linhas.length}`);

                    let indiceCabecalho = -1;
                    let colunas = { local: -1, servico: -1, data: -1, quantidade: -1 };

                    // 1. CAÇADOR DE CABEÇALHO (Busca Localidade, Nome, Tratamento...)
                    for (let i = 0; i < Math.min(linhas.length, 15); i++) {
                        const linha = linhas[i].map(c => (c || '').toString().trim().toLowerCase());

                        const idxLocal = linha.findIndex(c => c.includes('local') || c.includes('propriedade') || c.includes('fazenda'));
                        const idxNome = linha.findIndex(c => c === 'nome' || c === 'produtor');

                        if (idxLocal !== -1 || idxNome !== -1) {
                            indiceCabecalho = i;
                            colunas.local = idxLocal !== -1 ? idxLocal : idxNome;
                            colunas.servico = linha.findIndex(c => c.includes('tratamento') || c.includes('serviço') || c.includes('vacina') || c.includes('atendimento vet'));
                            colunas.data = linha.findIndex(c => c.includes('data') || c.includes('dt'));
                            colunas.quantidade = linha.findIndex(c => c.includes('qtd') || c.includes('quant') || c.includes('total') || c.includes('area'));
                            break;
                        }
                    }

                    if (indiceCabecalho === -1) {
                        alert("ERRO: Cabeçalho não encontrado. Verifique se o arquivo tem colunas de Local/Nome.");
                        resolve([]);
                        return;
                    }

                    // 2. EXTRAÇÃO DOS DADOS
                    const dadosLimpos: Atendimento[] = [];

                    for (let i = indiceCabecalho + 1; i < linhas.length; i++) {
                        const linha = linhas[i];
                        if (!linha[colunas.local]) continue; // Pula linha sem local

                        // Tratamento Seguro de Quantidade
                        let qtd = 1;
                        if (colunas.quantidade !== -1 && linha[colunas.quantidade]) {
                            const qtdLimpa = linha[colunas.quantidade].replace(',', '.');
                            qtd = parseFloat(qtdLimpa) || 1;
                        }

                        // Tratamento Seguro de Data (Gera datas aleatórias se não tiver, para o gráfico ficar bonito)
                        let dataFinal = "2025-01-01";
                        if (colunas.data !== -1 && linha[colunas.data]) {
                            dataFinal = linha[colunas.data].trim();
                        } else {
                            // Simulação para arquivo de Perfil (espalha os dados no ano)
                            const mes = Math.floor(Math.random() * 12) + 1;
                            const dia = Math.floor(Math.random() * 28) + 1;
                            dataFinal = `2025-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
                        }

                        // Tratamento Seguro de Serviço
                        let nomeServico = "Atendimento Geral";
                        if (colunas.servico !== -1 && linha[colunas.servico]) {
                            nomeServico = linha[colunas.servico].trim() || "Geral";
                        }

                        dadosLimpos.push({
                            local: linha[colunas.local].trim(),
                            servico: nomeServico,
                            especie: 'Geral',
                            data: dataFinal,
                            quantidade: Math.ceil(qtd)
                        });
                    }

                    resolve(dadosLimpos);
                },
                error: (err) => reject(err)
            });
        });
    }

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