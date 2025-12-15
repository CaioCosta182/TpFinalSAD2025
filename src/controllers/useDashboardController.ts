import { useState, useMemo } from 'react';
import { DataService } from '../services/DataService';
import type { Atendimento } from '../models/Types';

const service = new DataService();

export const useDashboardController = () => {
    // Estado dos dados dinâmicos
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
    const [filtroLocal, setFiltroLocal] = useState<string>('Todos');
    const [isLoading, setIsLoading] = useState(false);

    // Carrega dados estáticos para os gráficos secundários
    const estoque = service.getEstoque();
    const genetica = service.getGenetica();

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const dados = await service.parseAtendimentos(file);
            setAtendimentos(dados);
        } catch (error) {
            console.error("Erro ao ler arquivo:", error);
            alert("Erro ao processar o arquivo CSV.");
        } finally {
            setIsLoading(false);
        }
    };

    // Filtros
    const atendimentosFiltrados = useMemo(() => {
        if (filtroLocal === 'Todos') return atendimentos;
        return atendimentos.filter(item => item.local === filtroLocal);
    }, [filtroLocal, atendimentos]);

    // --- PREPARAÇÃO DOS DADOS PARA A VIEW ---

    // 1. Gráfico de Barras (Dinâmico do CSV)
    const dadosGraficoBarras = useMemo(() => {
        const agrupado: any = {};
        atendimentosFiltrados.forEach(a => {
            if (!agrupado[a.local]) agrupado[a.local] = { nome: a.local, total: 0 };
            agrupado[a.local].total += a.quantidade;
        });
        return Object.values(agrupado);
    }, [atendimentosFiltrados]);

    // 2. Linha do Tempo (Dinâmico do CSV)
    const dadosGraficoLinha = useMemo(() => {
        const porData: any = {};
        atendimentosFiltrados.forEach(a => {
            if (!porData[a.data]) porData[a.data] = { data: a.data, quantidade: 0 };
            porData[a.data].quantidade += a.quantidade;
        });
        return Object.values(porData).sort((a: any, b: any) => a.data.localeCompare(b.data));
    }, [atendimentosFiltrados]);

    // 3. Scatter Plot (Estático/Mock - Financeiro)
    const dadosGraficoScatter = estoque.map(e => ({
        x: e.quantidadeAtual,
        y: e.custoUnitario,
        z: e.quantidadeAtual * e.custoUnitario,
        name: e.nome
    }));

    // 4. Pizza (Estático/Mock - Genética)
    const dadosGraficoPizza = genetica;

    return {
        atendimentos,
        isLoading,
        handleFileUpload,
        filtroLocal,
        setFiltroLocal,
        dadosGraficoBarras,
        dadosGraficoLinha,
        dadosGraficoScatter, // Voltamos com ele
        dadosGraficoPizza,   // Voltamos com ele
        locaisDisponiveis: Array.from(new Set(atendimentos.map(a => a.local))).sort()
    };
};