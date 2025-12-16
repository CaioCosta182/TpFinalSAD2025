import React, { useMemo } from 'react';
import { Chart } from "react-google-charts";
import { Upload, FileSpreadsheet, Trophy, Clock, Activity, Search, ChevronDown, MapPin, MousePointerClick } from 'lucide-react';
import { useDashboardController } from '../controllers/useDashboardController';
import { ProdutorDetailView } from './ProdutorDetailView';

export const DashboardView: React.FC = () => {
    const {
        atendimentos, isLoading, handleFileUpload,
        filtroLocal, setFiltroLocal, locaisDisponiveis,
        rankingProdutores, destaquePorRegiao,
        dadosGraficoBarras, dadosGraficoLinha,
        dadosGraficoScatter, dadosGraficoServicos,
        produtorSelecionadoNome, selecionarProdutor, limparSelecao, dadosProdutorSelecionado,
        produtoresDaRegiao
    } = useDashboardController();

    const chartOptions = {
        backgroundColor: 'transparent',
        legend: { position: 'bottom', textStyle: { color: '#64748b', fontSize: 12 } },
        chartArea: { width: '85%', height: '70%' },
        vAxis: { textStyle: { color: '#94a3b8' }, gridlines: { color: '#e2e8f0', count: 4 }, baselineColor: 'transparent' },
        hAxis: { textStyle: { color: '#94a3b8' }, gridlines: { color: 'transparent' }, baselineColor: '#cbd5e1' },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444']
    };

    const dadosBarraGoogle = useMemo(() => {
        const header: (string | number)[][] = [["Localidade", "Total Serviços"]];
        const body = dadosGraficoBarras.map((d: any) => [String(d.nome || "Outros"), Number(d.total) || 0]).sort((a: any, b: any) => (b[1] as number) - (a[1] as number)).slice(0, 8);
        return header.concat(body);
    }, [dadosGraficoBarras]);

    const dadosLinhaGoogle = useMemo(() => {
        const header: (string | number)[][] = [["Data", "Volume"]];
        const body = dadosGraficoLinha.map((d: any) => {
            let labelData = String(d.data || "");
            if (labelData.includes('-')) labelData = labelData.split('-').slice(1).reverse().join('/');
            return [labelData, Number(d.quantidade) || 0];
        });
        return header.concat(body);
    }, [dadosGraficoLinha]);

    const dadosFinanceiroGoogle = useMemo(() => {
        const header: (string | number | object)[][] = [["Item", "Valor (R$)", { role: "style" }]];
        const body = dadosGraficoScatter.map((d: any) => {
            const val = Number(d.z) || 0;
            return { nome: String(d.name), valor: val, cor: val > 1000 ? "#10b981" : "#6366f1" };
        }).sort((a, b) => b.valor - a.valor).slice(0, 5).map(d => [d.nome, d.valor, d.cor]);
        return header.concat(body);
    }, [dadosGraficoScatter]);

    const dadosPizzaGoogle = useMemo(() => {
        const header: (string | number)[][] = [["Serviço", "Qtd"]];
        const body = dadosGraficoServicos.map((d: any) => [String(d.servico), Number(d.qtd) || 0]);
        return header.concat(body);
    }, [dadosGraficoServicos]);

    if (produtorSelecionadoNome) {
        return <ProdutorDetailView nome={produtorSelecionadoNome} dados={dadosProdutorSelecionado} onVoltar={limparSelecao} />;
    }

    const temDados = atendimentos.length > 0;
    const top1Produtor = rankingProdutores[0];

    return (
        // 1. FUNDO AZUL VIBRANTE (#3B82F6)
        <div className="min-h-screen bg-[#3B82F6] flex justify-center py-16 px-6 md:p-24 font-sans text-slate-800">

            {/* 2. CARD FLUTUANTE */}
            <div className="bg-white w-full max-w-[1600px] rounded-[48px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[800px]">

                {/* HEADER */}
                <div className="px-12 py-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 bg-white">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SAD Rural</h1>
                        <p className="text-slate-400 text-sm font-bold tracking-widest uppercase mt-2">Painel Gerencial</p>
                    </div>

                    <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full shadow-xl transition-transform active:scale-95 flex items-center gap-3">
                        <Upload size={18} />
                        <span className="font-bold text-xs tracking-widest">IMPORTAR CSV</span>
                        <input type="file" accept=".csv" multiple onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>

                {/* CONTEÚDO */}
                <div className="flex-1 p-12 md:p-20 overflow-y-auto custom-scrollbar bg-white">

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                            <p className="text-slate-400 font-bold">Processando...</p>
                        </div>
                    )}

                    {!temDados && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full py-32 bg-[#F8FAFC] rounded-[40px] border-2 border-dashed border-slate-200">
                            <FileSpreadsheet size={64} className="text-slate-300 mb-6" />
                            <h2 className="text-2xl font-bold text-slate-700">Painel Vazio</h2>
                            <p className="text-slate-400 mt-2">Importe os dados para visualizar.</p>
                        </div>
                    )}

                    {temDados && !isLoading && (
                        <div className="space-y-16">

                            {/* 1. SEÇÃO TOPO: KPIs + FILTRO (Largura Restrita ~1/3 visualmente centralizado) */}
                            <div className="flex flex-col items-center gap-8">

                                {/* KPIS */}
                                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div onClick={() => top1Produtor && selecionarProdutor(top1Produtor.nome)} className="bg-[#F8FAFC] p-6 rounded-[32px] border border-slate-200 hover:border-yellow-400 transition cursor-pointer flex flex-col items-center text-center gap-3 group hover:shadow-lg">
                                        <div className="bg-yellow-100 p-3 rounded-[20px] text-yellow-600 shadow-sm group-hover:scale-110 transition"><Trophy size={24} /></div>
                                        <div>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Destaque</p>
                                            <h3 className="text-lg font-bold text-slate-900 truncate max-w-[150px]">{top1Produtor?.nome || "-"}</h3>
                                            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center justify-center gap-1"><MapPin size={10} /> {top1Produtor?.local}</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#F8FAFC] p-6 rounded-[32px] border border-slate-200 flex flex-col items-center text-center gap-3">
                                        <div className="bg-indigo-100 p-3 rounded-[20px] text-indigo-600 shadow-sm"><Clock size={24} /></div>
                                        <div>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Horas Totais</p>
                                            <h3 className="text-2xl font-black text-slate-900">{top1Produtor ? top1Produtor.horas.toFixed(1) : 0}<span className="text-sm font-medium text-slate-400 ml-1">h</span></h3>
                                        </div>
                                    </div>

                                    <div className="bg-[#F8FAFC] p-6 rounded-[32px] border border-slate-200 flex flex-col items-center text-center gap-3">
                                        <div className="bg-emerald-100 p-3 rounded-[20px] text-emerald-600 shadow-sm"><Activity size={24} /></div>
                                        <div>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Volume</p>
                                            <h3 className="text-2xl font-black text-slate-900">{top1Produtor ? top1Produtor.totalAtendimentos : 0}</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* FILTRO + CONTADOR */}
                                <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-end items-center gap-4">
                                    {filtroLocal !== 'Todos' && (
                                        <span className="text-xs font-bold text-slate-500 bg-[#F8FAFC] px-6 py-3 rounded-full border border-slate-200 shadow-sm">
                                            {produtoresDaRegiao.length} Produtores encontrados
                                        </span>
                                    )}
                                    <div className="bg-[#F8FAFC] pl-6 pr-4 py-3 rounded-full border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-300 transition">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Search size={14} /> Filtrar:
                                        </span>
                                        <div className="relative">
                                            <select
                                                value={filtroLocal}
                                                onChange={(e) => setFiltroLocal(e.target.value)}
                                                className="appearance-none bg-transparent border-none text-sm font-bold text-slate-800 pr-8 cursor-pointer focus:ring-0 outline-none"
                                            >
                                                <option value="Todos">Todas as Localidades</option>
                                                {locaisDisponiveis.map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-0 top-1 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* GRÁFICOS */}
                            <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="bg-[#F8FAFC] border border-slate-200 p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-shadow duration-300">
                                    <h3 className="font-bold text-slate-800 mb-10 flex items-center gap-3 text-sm uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Demandas por Localidade
                                    </h3>
                                    <div className="h-80 w-full"><Chart chartType="BarChart" width="100%" height="100%" data={dadosBarraGoogle} options={{ ...chartOptions, colors: ['#4F46E5'] }} /></div>
                                </div>

                                <div className="bg-[#F8FAFC] border border-slate-200 p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-shadow duration-300">
                                    <h3 className="font-bold text-slate-800 mb-10 flex items-center gap-3 text-sm uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Evolução Temporal
                                    </h3>
                                    <div className="h-80 w-full"><Chart chartType="LineChart" width="100%" height="100%" data={dadosLinhaGoogle} options={{ ...chartOptions, colors: ['#10B981'], pointSize: 6, curveType: 'function' }} /></div>
                                </div>

                                <div className="bg-[#F8FAFC] border border-slate-200 p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-shadow duration-300">
                                    <h3 className="font-bold text-slate-800 mb-10 flex items-center gap-3 text-sm uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Estoque (Top Valor R$)
                                    </h3>
                                    <div className="h-80 w-full flex items-center justify-center">
                                        {dadosFinanceiroGoogle.length > 1 ? (
                                            <Chart chartType="ColumnChart" width="100%" height="100%" data={dadosFinanceiroGoogle} options={{ ...chartOptions, legend: 'none', hAxis: { ...chartOptions.hAxis, textPosition: 'out' } }} />
                                        ) : <span className="text-slate-300 font-medium">Sem dados financeiros</span>}
                                    </div>
                                </div>

                                <div className="bg-[#F8FAFC] border border-slate-200 p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-shadow duration-300">
                                    <h3 className="font-bold text-slate-800 mb-10 flex items-center gap-3 text-sm uppercase tracking-widest">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div> Mix de Serviços
                                    </h3>
                                    <div className="h-80 w-full"><Chart chartType="PieChart" width="100%" height="100%" data={dadosPizzaGoogle} options={{ ...chartOptions, pieHole: 0.6, legend: 'right' }} /></div>
                                </div>
                            </div>

                            {/* TABELA */}
                            <div className="max-w-[1400px] mx-auto w-full bg-[#F8FAFC] border border-slate-200 rounded-[40px] overflow-hidden shadow-sm p-4">
                                <div className="px-12 py-8 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Ranking Regional</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-400 uppercase bg-[#F8FAFC]">
                                            <tr>
                                                <th className="px-12 py-6 font-semibold tracking-wider">Região</th>
                                                <th className="px-12 py-6 font-semibold tracking-wider">Produtor</th>
                                                <th className="px-12 py-6 font-semibold tracking-wider text-right">Volume</th>
                                                <th className="px-12 py-6 font-semibold tracking-wider text-center">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {destaquePorRegiao.slice(0, 8).map((d, i) => (
                                                <tr key={i} onClick={() => selecionarProdutor(d.campeao)} className="hover:bg-white cursor-pointer transition rounded-2xl font-medium">
                                                    <td className="px-12 py-6 text-slate-500">{d.regiao}</td>
                                                    <td className="px-12 py-6 font-bold text-slate-800">{d.campeao}</td>
                                                    <td className="px-12 py-6 text-right font-mono text-slate-600">{d.totalAtendimentos}</td>
                                                    <td className="px-12 py-6 text-center">
                                                        <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                                                            <MousePointerClick size={20} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};