import Papa from 'papaparse';
import type { Atendimento, EstoqueMedicamento } from '../models/Types';

export class DataService {

    // --- UTILS ---
    private calcularHoras(entrada: string, saida: string, isVeterinaria: boolean): number {
        if (isVeterinaria && (!entrada || !saida)) return 0.5;
        try {
            const clean = (t: string) => t ? t.trim().split(':').slice(0, 2).map(n => parseInt(n, 10)) : [0, 0];
            const [h1, m1] = clean(entrada);
            const [h2, m2] = clean(saida);
            if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return isVeterinaria ? 0.5 : 0;
            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diff < 0) diff += 24 * 60;
            const res = parseFloat((diff / 60).toFixed(2));
            return res === 0 ? (isVeterinaria ? 0.5 : 0) : res;
        } catch { return isVeterinaria ? 0.5 : 0; }
    }

    private normalizarData(dataRaw: string): string {
        if (!dataRaw) return this.gerarDataAleatoria2025();
        try {
            const d = dataRaw.trim();
            if (d.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
                const [dia, mes, ano] = d.split('/');
                return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            }
            if (d.includes('-') && d.length >= 10) return d;
        } catch { }
        return this.gerarDataAleatoria2025();
    }

    private gerarDataAleatoria2025(): string {
        const start = new Date(2025, 0, 1);
        const end = new Date(2025, 11, 31);
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date.toISOString().split('T')[0];
    }

    private safeFloat(valor: string | undefined): number {
        if (!valor) return 0;
        try {
            let limpo = valor.toString();
            limpo = limpo.replace(/[R$\s]/g, '');
            // Se tiver ponto e virgula (1.000,00), remove ponto
            if (limpo.indexOf('.') !== -1 && limpo.indexOf(',') !== -1) {
                limpo = limpo.replace(/\./g, '');
            }
            limpo = limpo.replace(',', '.');
            const num = parseFloat(limpo);
            return isNaN(num) ? 0 : num;
        } catch { return 0; }
    }

    // --- MÉTODO PÚBLICO PRINCIPAL (CORRIGIDO) ---
    public async processarArquivos(files: FileList): Promise<{ atendimentos: Atendimento[], estoque: EstoqueMedicamento[] }> {
        const todosAtendimentos: Atendimento[] = [];
        const todoEstoque: EstoqueMedicamento[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // console.log(`Lendo: ${file.name}`);
            const resultado = await this.lerArquivoUnico(file);

            if (resultado.tipo === 'ATENDIMENTO') {
                todosAtendimentos.push(...(resultado.dados as Atendimento[]));
            } else if (resultado.tipo === 'ESTOQUE') {
                todoEstoque.push(...(resultado.dados as EstoqueMedicamento[]));
            }
        }

        return { atendimentos: todosAtendimentos, estoque: todoEstoque };
    }

    // --- PROCESSAMENTO INTERNO ---
    private lerArquivoUnico(file: File): Promise<{ tipo: 'ATENDIMENTO' | 'ESTOQUE' | 'IGNORAR', dados: any[] }> {
        return new Promise((resolve) => {
            Papa.parse(file, {
                header: false,
                skipEmptyLines: true,
                delimiter: "", // Auto-detect
                encoding: "ISO-8859-1", // Suporte a acentos Excel
                complete: (results) => {
                    try {
                        const linhas = results.data as string[][];
                        if (!linhas || linhas.length === 0) { resolve({ tipo: 'IGNORAR', dados: [] }); return; }

                        let indiceCabecalho = -1;
                        let tipoArquivo = 'DESCONHECIDO';

                        // Mapeamento de colunas
                        let col = {
                            nome: -1, local: -1,
                            atendimentoVet: -1, carvoejamento: -1,
                            servico: -1, data: -1, qtd: -1, horaEnt: -1, horaSai: -1,
                            item: -1, custo: -1, qtdAtual: -1
                        };

                        // 1. DETECÇÃO DO CABEÇALHO
                        for (let i = 0; i < Math.min(linhas.length, 25); i++) {
                            const linha = linhas[i].map(c => (c || '').toString().trim().toLowerCase());

                            // Estoque
                            if ((linha.some(c => c.includes('insumo') || c.includes('medicamento') || c.includes('descrição'))) &&
                                (linha.some(c => c.includes('custo') || c.includes('valor')))) {
                                indiceCabecalho = i; tipoArquivo = 'ESTOQUE';
                                col.item = linha.findIndex(c => c.includes('insumo') || c.includes('medicamento') || c.includes('descrição'));
                                col.custo = linha.findIndex(c => c.includes('custo') || c.includes('valor'));
                                col.qtdAtual = linha.findIndex(c => c.includes('quantidade') || c.includes('estoque') || c.includes('saldo'));
                                break;
                            }

                            // Mestre Perfil (Seu arquivo principal)
                            if (linha.some(c => c.includes('atendimento vet')) && linha.some(c => c.includes('carvoejamento'))) {
                                indiceCabecalho = i; tipoArquivo = 'MESTRE_PERFIL';
                                col.nome = linha.findIndex(c => c.includes('nome'));
                                col.local = linha.findIndex(c => c.includes('localidade') || c.includes('local'));
                                col.atendimentoVet = linha.findIndex(c => c.includes('atendimento vet'));
                                col.carvoejamento = linha.findIndex(c => c.includes('carvoejamento'));
                                break;
                            }

                            // Silvicultura
                            if (file.name.toLowerCase().includes('silvicultura') || linha.some(c => c.includes('area total'))) {
                                indiceCabecalho = i; tipoArquivo = 'SILVICULTURA';
                                col.nome = linha.findIndex(c => c.includes('nome'));
                                col.local = linha.findIndex(c => c.includes('local'));
                                col.servico = linha.findIndex(c => c.includes('serviço'));
                                col.data = linha.findIndex(c => c.includes('data'));
                                col.qtd = linha.findIndex(c => c.includes('area') || c.includes('área'));
                                break;
                            }

                            // Veterinária Detalhada
                            if (linha.some(c => c.includes('animais atendidos'))) {
                                indiceCabecalho = i; tipoArquivo = 'VETERINARIA';
                                col.nome = linha.findIndex(c => c.includes('nome'));
                                col.local = linha.findIndex(c => c.includes('local'));
                                col.servico = linha.findIndex(c => c.includes('tratamento'));
                                col.qtd = linha.findIndex(c => c.includes('animais'));
                                col.horaEnt = linha.findIndex(c => c.includes('entrada'));
                                col.horaSai = linha.findIndex(c => c.includes('saida'));
                                col.data = linha.findIndex(c => c.includes('data'));
                                break;
                            }
                        }

                        if (indiceCabecalho === -1) { resolve({ tipo: 'IGNORAR', dados: [] }); return; }

                        const dadosProcessados: any[] = [];

                        // 2. EXTRAÇÃO DE DADOS
                        for (let i = indiceCabecalho + 1; i < linhas.length; i++) {
                            const linha = linhas[i];
                            if (!linha) continue;

                            // === ESTOQUE ===
                            if (tipoArquivo === 'ESTOQUE') {
                                if (col.item === -1 || !linha[col.item]) continue;
                                const nomeItem = linha[col.item].trim();
                                if (!nomeItem || nomeItem.toLowerCase().startsWith('total')) continue;

                                dadosProcessados.push({
                                    nome: nomeItem,
                                    custoUnitario: col.custo !== -1 ? this.safeFloat(linha[col.custo]) : 0,
                                    quantidadeAtual: col.qtdAtual !== -1 ? this.safeFloat(linha[col.qtdAtual]) : 0,
                                    categoria: 'Insumo'
                                });
                                continue;
                            }

                            // === ATENDIMENTOS ===
                            const valNome = (col.nome !== -1) ? linha[col.nome] : null;
                            if (!valNome) continue;

                            const nome = valNome.trim();
                            const local = (col.local !== -1 && linha[col.local]) ? linha[col.local].trim() : "Geral";
                            // Se não tiver coluna de data, gera uma aleatória para não quebrar o gráfico de linha
                            const data = (col.data !== -1 && linha[col.data]) ? this.normalizarData(linha[col.data]) : this.gerarDataAleatoria2025();

                            if (tipoArquivo === 'MESTRE_PERFIL') {
                                if (col.atendimentoVet !== -1) {
                                    const q = this.safeFloat(linha[col.atendimentoVet]);
                                    if (q > 0) dadosProcessados.push({ nomeProdutor: nome, local, servico: "Atendimento Veterinário", especie: "Geral", quantidade: q, horas: q * 2, data });
                                }
                                if (col.carvoejamento !== -1) {
                                    const q = this.safeFloat(linha[col.carvoejamento]);
                                    if (q > 0) dadosProcessados.push({ nomeProdutor: nome, local, servico: "Silvicultura", especie: "N/A", quantidade: q, horas: q * 4, data });
                                }
                                continue;
                            }

                            let servico = "Atendimento";
                            let qtd = 1;
                            let horas = 0.5;

                            if (tipoArquivo === 'SILVICULTURA') {
                                servico = (col.servico !== -1) ? linha[col.servico] : "Silvicultura";
                                qtd = 1;
                                const area = (col.qtd !== -1) ? this.safeFloat(linha[col.qtd]) : 0;
                                horas = (area > 0 ? area : 1) * 3;
                            }
                            else if (tipoArquivo === 'VETERINARIA') {
                                servico = "Veterinária";
                                if (col.qtd !== -1) qtd = this.safeFloat(linha[col.qtd]) || 1;
                                if (col.horaEnt !== -1 && col.horaSai !== -1) horas = this.calcularHoras(linha[col.horaEnt], linha[col.horaSai], true);
                            }

                            dadosProcessados.push({ nomeProdutor: nome, local, servico, especie: "Geral", quantidade: qtd, data, horas });
                        }

                        resolve({ tipo: tipoArquivo === 'ESTOQUE' ? 'ESTOQUE' : 'ATENDIMENTO', dados: dadosProcessados });
                    } catch (err) {
                        console.error("Erro parsing CSV", err);
                        resolve({ tipo: 'IGNORAR', dados: [] });
                    }
                },
                error: () => resolve({ tipo: 'IGNORAR', dados: [] })
            });
        });
    }

    // Dados Mockados de Insumos (Integrado)
    public getEstoque(): EstoqueMedicamento[] {
        return [
            { nome: "Agua destilada 5l", quantidadeAtual: 1, custoUnitario: 25.00, categoria: "Insumo" },
            { nome: "Agua Oxigenada 10 Vol 1l", quantidadeAtual: 11, custoUnitario: 6.25, categoria: "Insumo" },
            { nome: "Agulha 25x7", quantidadeAtual: 500, custoUnitario: 0.30, categoria: "Insumo" },
            { nome: "Agulha 40x1,20 mm", quantidadeAtual: 1000, custoUnitario: 0.10, categoria: "Insumo" },
            { nome: "Alcool gel 500g", quantidadeAtual: 7, custoUnitario: 8.00, categoria: "Insumo" },
            { nome: "Alcool gel 5l", quantidadeAtual: 4, custoUnitario: 80.00, categoria: "Insumo" },
            { nome: "Algodão 500g", quantidadeAtual: 8, custoUnitario: 15.98, categoria: "Insumo" },
            { nome: "Atadura Crepe 13 Fios", quantidadeAtual: 120, custoUnitario: 0.54, categoria: "Insumo" },
            { nome: "Avental manga curta desc.", quantidadeAtual: 25, custoUnitario: 5.00, categoria: "Insumo" },
            { nome: "Desinfetante Duofor 1L", quantidadeAtual: 6, custoUnitario: 76.26, categoria: "Insumo" },
            { nome: "Luva Procedimento", quantidadeAtual: 100, custoUnitario: 0.50, categoria: "Insumo" },
            { nome: "Soro EGG", quantidadeAtual: 44, custoUnitario: 160.88, categoria: "Medicamento" },
            { nome: "Seringa 10ml sem agulha", quantidadeAtual: 467, custoUnitario: 0.70, categoria: "Insumo" },
            { nome: "Seringa 20ml com agulha", quantidadeAtual: 69, custoUnitario: 1.50, categoria: "Insumo" },
            { nome: "Sonda Traqueal", quantidadeAtual: 5, custoUnitario: 8.10, categoria: "Insumo" },
            { nome: "Tintura de iodo 500ml", quantidadeAtual: 5, custoUnitario: 20.00, categoria: "Insumo" }
        ];
    }
}