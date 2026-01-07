import { useState, useMemo } from 'react';
import { DataService } from '../services/DataService';
import type { Atendimento, EstoqueMedicamento } from '../models/Types';

const service = new DataService();

export const useDashboardController = () => {
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);

    const [estoque, setEstoque] = useState<EstoqueMedicamento[]>(service.getEstoque());

    const [filtroLocal, setFiltroLocal] = useState<string>('Todos');
    const [isLoading, setIsLoading] = useState(false);
    const [produtorSelecionadoNome, setProdutorSelecionadoNome] = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsLoading(true);
        try {
            const resultado = await service.processarArquivos(files);

            if (resultado.atendimentos.length > 0) {
                setAtendimentos(prev => [...prev, ...resultado.atendimentos]);
            }

            if (resultado.estoque.length > 0) {
                setEstoque(resultado.estoque);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao processar arquivos.");
        } finally {
            setIsLoading(false);
        }
    };

    const selecionarProdutor = (nome: string) => {
        setProdutorSelecionadoNome(nome);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const limparSelecao = () => setProdutorSelecionadoNome(null);

    const dadosProdutorSelecionado = useMemo(() => {
        if (!produtorSelecionadoNome) return [];
        return atendimentos.filter(a => a.nomeProdutor === produtorSelecionadoNome);
    }, [produtorSelecionadoNome, atendimentos]);

    const atendimentosFiltrados = useMemo(() => {
        if (filtroLocal === 'Todos') return atendimentos;
        return atendimentos.filter(item => item.local === filtroLocal);
    }, [filtroLocal, atendimentos]);

    const produtoresDaRegiao = useMemo(() => {
        if (filtroLocal === 'Todos') return [];
        const mapa = new Map<string, { nome: string, totalAtendimentos: number }>();
        atendimentosFiltrados.forEach(a => {
            if (a.nomeProdutor === "Não Identificado") return;
            const atual = mapa.get(a.nomeProdutor) || { nome: a.nomeProdutor, totalAtendimentos: 0 };
            atual.totalAtendimentos += a.quantidade;
            mapa.set(a.nomeProdutor, atual);
        });
        return Array.from(mapa.values()).sort((a, b) => b.totalAtendimentos - a.totalAtendimentos);
    }, [atendimentosFiltrados, filtroLocal]);

    const rankingProdutores = useMemo(() => {
        const mapa = new Map<string, { nome: string, totalAtendimentos: number, horas: number, local: string }>();
        atendimentos.forEach(a => {
            if (a.nomeProdutor === "Não Identificado") return;
            const atual = mapa.get(a.nomeProdutor) || { nome: a.nomeProdutor, totalAtendimentos: 0, horas: 0, local: a.local };
            atual.totalAtendimentos += a.quantidade;
            atual.horas += a.horas;
            mapa.set(a.nomeProdutor, atual);
        });
        return Array.from(mapa.values()).sort((a, b) => b.totalAtendimentos - a.totalAtendimentos);
    }, [atendimentos]);

    const destaquePorRegiao = useMemo(() => {
        const tree: Record<string, Record<string, number>> = {};
        atendimentos.forEach(a => {
            if (!tree[a.local]) tree[a.local] = {};
            if (!tree[a.local][a.nomeProdutor]) tree[a.local][a.nomeProdutor] = 0;
            tree[a.local][a.nomeProdutor] += a.quantidade;
        });
        const resultados = [];
        for (const regiao in tree) {
            let campeao = "";
            let maxTotal = 0;
            for (const produtor in tree[regiao]) {
                if (tree[regiao][produtor] > maxTotal) {
                    maxTotal = tree[regiao][produtor];
                    campeao = produtor;
                }
            }
            if (campeao && campeao !== "Não Identificado") {
                resultados.push({ regiao, campeao, totalAtendimentos: maxTotal });
            }
        }
        return resultados.sort((a, b) => b.totalAtendimentos - a.totalAtendimentos);
    }, [atendimentos]);

    // Gráficos
    const dadosGraficoBarras = useMemo(() => {
        const agrupado: any = {};
        atendimentosFiltrados.forEach(a => {
            if (!agrupado[a.local]) agrupado[a.local] = { nome: a.local, total: 0 };
            agrupado[a.local].total += a.quantidade;
        });
        return Object.values(agrupado);
    }, [atendimentosFiltrados]);

    const dadosGraficoLinha = useMemo(() => {
        const porData: any = {};
        atendimentosFiltrados.forEach(a => {
            if (!porData[a.data]) porData[a.data] = { data: a.data, quantidade: 0 };
            porData[a.data].quantidade += a.quantidade;
        });
        return Object.values(porData).sort((a: any, b: any) => a.data.localeCompare(b.data));
    }, [atendimentosFiltrados]);

    const dadosGraficoServicos = useMemo(() => {
        const count: Record<string, number> = {};
        atendimentosFiltrados.forEach(a => {
            const s = a.servico || "Outros";
            count[s] = (count[s] || 0) + a.quantidade;
        });
        return Object.entries(count)
            .map(([servico, qtd]) => ({ servico, qtd }))
            .sort((a, b) => b.qtd - a.qtd);
    }, [atendimentosFiltrados]);

    const dadosGraficoScatter = useMemo(() => {
        return estoque.map(e => ({
            x: e.quantidadeAtual,
            y: e.custoUnitario,
            z: e.quantidadeAtual * e.custoUnitario,
            name: e.nome,
            categoria: e.categoria
        }));
    }, [estoque]);

    return {
        atendimentos, isLoading, handleFileUpload,
        filtroLocal, setFiltroLocal,
        rankingProdutores, destaquePorRegiao, produtoresDaRegiao, // Adicionado produtoresDaRegiao
        dadosGraficoBarras, dadosGraficoLinha, dadosGraficoScatter, dadosGraficoServicos, // Adicionado dadosGraficoServicos
        locaisDisponiveis: Array.from(new Set(atendimentos.map(a => a.local))).sort(),
        produtorSelecionadoNome, selecionarProdutor, limparSelecao, dadosProdutorSelecionado
    };
};