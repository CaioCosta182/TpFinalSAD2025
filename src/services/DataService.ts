import Papa from 'papaparse';
import type { Atendimento, EstoqueMedicamento, SemenGenetica } from '../models/Types';

export class DataService {

    parseAtendimentos(file: File): Promise<Atendimento[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: false, // Ler como matriz para ignorar sujeira no topo
                skipEmptyLines: true,
                encoding: "ISO-8859-1", // Encoding do Excel Brasil
                complete: (results) => {
                    const linhas = results.data as string[][];
                    console.log("--- DEBUGGER SUPREMO ---");
                    console.log(`Total linhas lidas: ${linhas.length}`);

                    if (linhas.length > 0) {
                        console.log("Primeira linha crua:", linhas[0]);
                    }

                    let indiceCabecalho = -1;
                    let colunas = {
                        local: -1,
                        servico: -1,
                        especie: -1,
                        data: -1,
                        quantidade: -1
                    };

                    // 1. ESTRATÉGIA: Busca qualquer linha que pareça um cabeçalho
                    // Procura por "Local" ou "Nome" ou "Data"
                    for (let i = 0; i < Math.min(linhas.length, 15); i++) {
                        // Normaliza a linha para letras minúsculas e remove espaços
                        const linha = linhas[i].map(c => (c || '').toString().trim().toLowerCase());

                        // Tenta achar colunas chaves
                        const idxLocal = linha.findIndex(c => c.includes('local') || c.includes('propriedade') || c.includes('fazenda'));
                        const idxNome = linha.findIndex(c => c === 'nome' || c.includes('produtor'));

                        // Se achou pelo menos Local ou Nome, assume que é o cabeçalho
                        if (idxLocal !== -1 || idxNome !== -1) {
                            indiceCabecalho = i;
                            colunas.local = idxLocal !== -1 ? idxLocal : idxNome; // Se não tem local, usa nome como referência geográfica provisória

                            // Tenta achar as outras colunas
                            colunas.servico = linha.findIndex(c => c.includes('tratamento') || c.includes('serviço') || c.includes('servico') || c.includes('vacina') || c.includes('tipo'));
                            colunas.especie = linha.findIndex(c => c.includes('especie') || c.includes('espécie'));
                            colunas.data = linha.findIndex(c => c.includes('data') || c.includes('dt'));
                            colunas.quantidade = linha.findIndex(c => c.includes('qtd') || c.includes('quant') || c.includes('animais') || c.includes('total') || c.includes('area'));

                            console.log(`Cabeçalho encontrado na linha ${i}:`, colunas);
                            break;
                        }
                    }

                    if (indiceCabecalho === -1) {
                        alert("ERRO: Não encontrei nenhuma linha de cabeçalho (Local/Nome/Data). Verifique se o arquivo é um CSV válido.");
                        resolve([]);
                        return;
                    }

                    // 2. PROCESSAMENTO
                    const dadosLimpos: Atendimento[] = [];

                    for (let i = indiceCabecalho + 1; i < linhas.length; i++) {
                        const linha = linhas[i];

                        // Se a linha for menor que o índice da coluna principal, pula
                        if (!linha[colunas.local]) continue;

                        // Tratamento da Quantidade (se não achar coluna, assume 1)
                        let qtd = 1;
                        if (colunas.quantidade !== -1 && linha[colunas.quantidade]) {
                            // Tenta limpar "2.5" ou "2,5" para numero
                            const qtdLimpa = linha[colunas.quantidade].replace(',', '.');
                            qtd = parseFloat(qtdLimpa);
                            if (isNaN(qtd)) qtd = 1;
                        }

                        // Tratamento do Serviço (se não achar coluna, assume "Atendimento Geral")
                        let nomeServico = "Atendimento Geral";
                        if (colunas.servico !== -1 && linha[colunas.servico]) {
                            nomeServico = linha[colunas.servico].trim();
                        } else if (file.name.toLowerCase().includes('vacina')) {
                            nomeServico = "Vacinação"; // Inteligência baseada no nome do arquivo
                        } else if (file.name.toLowerCase().includes('silvicultura')) {
                            nomeServico = "Silvicultura";
                        }

                        // Tratamento da Data
                        let dataFinal = "2025-01-01";
                        if (colunas.data !== -1 && linha[colunas.data]) {
                            dataFinal = linha[colunas.data].trim();
                        }

                        dadosLimpos.push({
                            local: linha[colunas.local].trim(),
                            servico: nomeServico,
                            especie: (colunas.especie !== -1 && linha[colunas.especie]) ? linha[colunas.especie] : 'Geral',
                            data: dataFinal,
                            quantidade: Math.ceil(qtd) // Arredonda para cima
                        });
                    }

                    console.log(`Sucesso! ${dadosLimpos.length} linhas importadas.`);
                    resolve(dadosLimpos);
                },
                error: (err) => {
                    console.error(err);
                    reject(err);
                }
            });
        });
    }

    // --- DADOS MOCKADOS (Mantidos) ---
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