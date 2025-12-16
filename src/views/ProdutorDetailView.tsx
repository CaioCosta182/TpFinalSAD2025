import React from 'react';
import { Chart } from "react-google-charts";
import { ArrowLeft, MapPin, User, CheckCircle, FileText, Clock, Activity } from 'lucide-react';
import type { Atendimento } from '../models/Types';

interface ProdutorDetailProps {
    nome: string;
    dados: Atendimento[];
    onVoltar: () => void;
}

export const ProdutorDetailView: React.FC<ProdutorDetailProps> = ({ nome, dados, onVoltar }) => {
    const totalVisitas = dados.reduce((acc, curr) => acc + Number(curr.quantidade || 0), 0);
    const totalHoras = dados.reduce((acc, curr) => acc + Number(curr.horas || 0), 0);
    const locais = Array.from(new Set(dados.map(d => String(d.local || "Geral")))).join(', ');

    const chartOptions = {
        backgroundColor: 'transparent',
        legend: { position: 'none' },
        chartArea: { width: '90%', height: '75%' },
        vAxis: { gridlines: { color: '#e2e8f0' }, textStyle: { color: '#94a3b8' } },
        hAxis: { gridlines: { color: 'transparent' }, textStyle: { color: '#94a3b8' } },
        colors: ['#6366f1', '#10b981', '#f59e0b']
    };

    const dadosPizza: (string | number)[][] = [["Serviço", "Qtd"]];
    const servicosCount: Record<string, number> = {};
    dados.forEach(d => {
        const s = String(d.servico || "Geral");
        servicosCount[s] = (servicosCount[s] || 0) + Number(d.quantidade || 0);
    });
    Object.entries(servicosCount).forEach(([k, v]) => dadosPizza.push([String(k), Number(v)]));

    const dadosLinha: (string | number)[][] = [["Data", "Qtd"]];
    const timeline: Record<string, number> = {};
    dados.forEach(d => {
        const dataKey = String(d.data);
        timeline[dataKey] = (timeline[dataKey] || 0) + Number(d.quantidade || 0);
    });
    Object.keys(timeline).sort().forEach(date => {
        let label = date;
        if (date.includes('-')) label = date.split('-').slice(1).reverse().join('/');
        dadosLinha.push([String(label), Number(timeline[date])]);
    });

    return (
        <div className="min-h-screen bg-[#3B82F6] flex justify-center py-16 px-6 md:p-24 font-sans text-slate-800 relative">

            {/* --- MODIFICAÇÃO: BOTÃO FIXO NO CANTO SUPERIOR ESQUERDO --- */}
            {/* Ocupa o canto da tela (viewport) independente da rolagem */}
            <div className="fixed top-0 left-0 p-6 z-50">
                <button
                    onClick={onVoltar}
                    className="flex items-center gap-3 text-white font-bold text-sm bg-black/10 hover:bg-black/20 backdrop-blur-md px-8 py-3 rounded-full transition shadow-lg border border-white/20"
                >
                    <ArrowLeft size={18} /> VOLTAR
                </button>
            </div>
            {/* ---------------------------------------------------------- */}

            {/* 2. CARD FLUTUANTE */}
            <div className="bg-white w-full max-w-[1400px] rounded-[48px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[800px]">

                {/* Header ajustado: removi o botão daqui e deixei apenas o título alinhado à direita */}
                <div className="px-12 py-10 border-b border-slate-100 flex items-center justify-end bg-white z-20 sticky top-0">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Detalhes do Produtor</span>
                </div>

                <div className="flex-1 overflow-y-auto p-12 md:p-20 space-y-20 custom-scrollbar bg-white">

                    {/* HEADER INFO */}
                    <div className="bg-[#F8FAFC] p-12 rounded-[40px] flex flex-col md:flex-row items-center gap-12 border border-slate-200 shadow-sm">
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-indigo-600 border-8 border-[#F8FAFC] shadow-sm shrink-0">
                            <User size={48} />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-4">{nome}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <span className="bg-white text-slate-500 px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-sm"><MapPin size={14} /> {locais}</span>
                                <span className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-200 shadow-sm"><CheckCircle size={14} /> Ativo</span>
                            </div>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="bg-[#F8FAFC] p-10 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-8 hover:shadow-lg transition">
                            <div className="bg-blue-50 p-6 rounded-[24px] text-blue-600"><FileText size={32} /></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p><p className="text-4xl font-black text-slate-900 mt-1">{totalVisitas}</p></div>
                        </div>
                        <div className="bg-[#F8FAFC] p-10 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-8 hover:shadow-lg transition">
                            <div className="bg-green-50 p-6 rounded-[24px] text-green-600"><Clock size={32} /></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Horas</p><p className="text-4xl font-black text-slate-900 mt-1">{totalHoras.toFixed(1)}h</p></div>
                        </div>
                        <div className="bg-[#F8FAFC] p-10 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-8 hover:shadow-lg transition">
                            <div className="bg-purple-50 p-6 rounded-[24px] text-purple-600"><Activity size={32} /></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Média</p><p className="text-4xl font-black text-slate-900 mt-1">{(totalVisitas > 0 ? totalHoras / totalVisitas : 0).toFixed(1)}h</p></div>
                        </div>
                    </div>

                    {/* GRÁFICOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="bg-[#F8FAFC] border border-slate-200 p-12 rounded-[40px] shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-10 uppercase tracking-wide">Mix de Serviços</h3>
                            <div className="h-72"><Chart chartType="PieChart" width="100%" height="100%" data={dadosPizza} options={{ ...chartOptions, pieHole: 0.6 }} /></div>
                        </div>
                        <div className="bg-[#F8FAFC] border border-slate-200 p-12 rounded-[40px] shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-10 uppercase tracking-wide">Histórico</h3>
                            <div className="h-72">
                                {dadosLinha.length > 1 ? (
                                    <Chart chartType="AreaChart" width="100%" height="100%" data={dadosLinha} options={{ ...chartOptions, colors: ['#6366f1'], areaOpacity: 0.1 }} />
                                ) : <div className="h-full flex items-center justify-center text-slate-300 font-medium">Sem dados históricos</div>}
                            </div>
                        </div>
                    </div>

                    {/* TABELA */}
                    <div className="bg-[#F8FAFC] border border-slate-200 rounded-[40px] overflow-hidden shadow-sm p-4">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-[#F8FAFC]">
                                <tr>
                                    <th className="p-8 font-semibold pl-12">Data</th>
                                    <th className="p-8 font-semibold">Serviço</th>
                                    <th className="p-8 font-semibold text-right">Qtd</th>
                                    <th className="p-8 font-semibold text-right pr-12">Horas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {dados.map((d, i) => (
                                    <tr key={i} className="hover:bg-white transition rounded-2xl">
                                        <td className="p-8 font-medium pl-12 text-slate-900">{d.data.includes('-') ? d.data.split('-').reverse().join('/') : d.data}</td>
                                        <td className="p-8 text-slate-500">{d.servico}</td>
                                        <td className="p-8 text-right font-mono text-slate-600 font-bold">{Number(d.quantidade).toFixed(1).replace('.0', '')}</td>
                                        <td className="p-8 text-right font-mono text-indigo-600 font-bold pr-12">{Number(d.horas).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};