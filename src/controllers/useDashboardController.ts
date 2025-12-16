import { useState, useMemo } from 'react';
import { DataService } from '../services/DataService';
import type { Atendimento } from '../models/Types';

const service = new DataService();

export const useDashboardController = () => {
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
    const [filtroLocal, setFiltroLocal] = useState<string>('Todos');
    const [isLoading, setIsLoading] = useState(false);

    // --- NOVO ESTADO: CONTROLE DE TELA ---
    const [produtorSelecionadoNome, setProdutorSelecionadoNome] = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        try {
            const dados = await service.parseAtendimentos(file);
            setAtendimentos(dados);
        } catch (error) {
            console.error(error);
            alert("Erro ao processar arquivo.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGICA DE SELEÇÃO ---
    const selecionarProdutor = (nome: string) => {
        setProdutorSelecionadoNome(nome);
        // Rola a página para o topo ao trocar de tela
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const limparSelecao = () => {
        setProdutorSelecionadoNome(null);
    };

    // Dados do produtor selecionado (Memoizado para performance)
    const dadosProdutorSelecionado = useMemo(() => {
        if (!produtorSelecionadoNome) return [];
        return atendimentos.filter(a => a.nomeProdutor === produtorSelecionadoNome);
    }, [produtorSelecionadoNome, atendimentos]);


    // --- RESTO DO CÓDIGO (DASHBOARD GERAL) ---
    const estoque = service.getEstoque();
    const genetica = service.getGenetica();

    const atendimentosFiltrados = useMemo(() => {
        if (filtroLocal === 'Todos') return atendimentos;
        return atendimentos.filter(item => item.local === filtroLocal);
    }, [filtroLocal, atendimentos]);

    const rankingProdutores = useMemo(() => {
        const mapa = new Map<string, { nome: string, visitas: number, horas: number, local: string }>();
        atendimentos.forEach(a => {
            if (a.nomeProdutor === "Não Identificado") return;
            const atual = mapa.get(a.nomeProdutor) || { nome: a.nomeProdutor, visitas: 0, horas: 0, local: a.local };
            atual.visitas += 1;
            atual.horas += a.horas;
            mapa.set(a.nomeProdutor, atual);
        });
        return Array.from(mapa.values()).sort((a, b) => b.visitas - a.visitas);
    }, [atendimentos]);

    const destaquePorRegiao = useMemo(() => {
        const tree: Record<string, Record<string, number>> = {};
        atendimentos.forEach(a => {
            if (!tree[a.local]) tree[a.local] = {};
            if (!tree[a.local][a.nomeProdutor]) tree[a.local][a.nomeProdutor] = 0;
            tree[a.local][a.nomeProdutor]++;
        });
        const resultados = [];
        for (const regiao in tree) {
            let campeao = "";
            let maxVisitas = 0;
            for (const produtor in tree[regiao]) {
                if (tree[regiao][produtor] > maxVisitas) {
                    maxVisitas = tree[regiao][produtor];
                    campeao = produtor;
                }
            }
            if (campeao && campeao !== "Não Identificado") resultados.push({ regiao, campeao, visitas: maxVisitas });
        }
        return resultados.sort((a, b) => b.visitas - a.visitas);
    }, [atendimentos]);

    // Google Charts Data Preparations
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

    return {
        atendimentos,
        isLoading,
        handleFileUpload,
        filtroLocal,
        setFiltroLocal,
        rankingProdutores,
        destaquePorRegiao,
        dadosGraficoBarras,
        dadosGraficoLinha,
        dadosGraficoScatter: estoque.map(e => ({ x: e.quantidadeAtual, y: e.custoUnitario, z: e.quantidadeAtual * e.custoUnitario, name: e.nome })),
        dadosGraficoPizza: genetica,
        locaisDisponiveis: Array.from(new Set(atendimentos.map(a => a.local))).sort(),

        // Novas exportações para a View
        produtorSelecionadoNome,
        selecionarProdutor,
        limparSelecao,
        dadosProdutorSelecionado
    };
};