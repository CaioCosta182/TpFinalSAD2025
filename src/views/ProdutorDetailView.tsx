import React from 'react';
import { Chart } from "react-google-charts";
import { ArrowLeft, MapPin, Activity, Calendar } from 'lucide-react'; // Removido 'Clock'
import type { Atendimento } from '../models/Types';

interface ProdutorDetailProps {
    nome: string;
    dados: Atendimento[];
    onVoltar: () => void;
}

export const ProdutorDetailView: React.FC<ProdutorDetailProps> = ({ nome, dados, onVoltar }) => {

    // --- CÁLCULOS ---
    const totalVisitas = dados.length;
    const totalHoras = dados.reduce((acc, curr) => acc + curr.horas, 0);
    const locais = Array.from(new Set(dados.map(d => d.local))).join(', ');

    // Gráfico 1: Distribuição de Serviços (Pizza)
    // CORREÇÃO: Tipagem explícita para aceitar String e Number no mesmo array
    const dadosPizza: (string | number)[][] = [["Serviço", "Qtd"]];

    const servicosCount: Record<string, number> = {};
    dados.forEach(d => {
        const s = d.servico || "Geral";
        servicosCount[s] = (servicosCount[s] || 0) + 1;
    });
    Object.entries(servicosCount).forEach(([k, v]) => dadosPizza.push([k, v]));

    // Gráfico 2: Linha do Tempo
    // CORREÇÃO: Tipagem explícita aqui também
    const dadosLinha: (string | number)[][] = [["Data", "Qtd"]];

    const timeline: Record<string, number> = {};
    dados.forEach(d => {
        timeline[d.data] = (timeline[d.data] || 0) + d.quantidade;
    });

    Object.keys(timeline).sort().forEach(date => {
        // Formata YYYY-MM-DD para DD/MM
        let label = date;
        if (date.includes('-')) {
            label = date.split('-').slice(1).reverse().join('/');
        }
        dadosLinha.push([label, timeline[date]]);
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-8 animate-fade-in">
            {/* Botão Voltar */}
            <button
                onClick={onVoltar}
                className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
            >
                <ArrowLeft size={20} /> Voltar para o Dashboard
            </button>

            {/* Cabeçalho */}
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border-t-4 border-blue-600">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{nome}</h1>
                <div className="flex flex-wrap gap-4 text-gray-500">
                    <div className="flex items-center gap-1"><MapPin size={18} /> {locais}</div>
                    <div className="flex items-center gap-1"><Activity size={18} /> Cliente Ativo</div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm uppercase font-bold">Total Visitas</p>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{totalVisitas}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <p className="text-gray-500 text-sm uppercase font-bold">Horas Técnicas</p>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{totalHoras.toFixed(1)} h</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <p className="text-gray-500 text-sm uppercase font-bold">Média por Visita</p>
                    <p className="text-4xl font-bold text-gray-800 mt-2">
                        {(totalVisitas > 0 ? totalHoras / totalVisitas : 0).toFixed(1)} h
                    </p>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Tipos de Serviços Solicitados</h3>
                    <Chart
                        chartType="PieChart"
                        width="100%"
                        height="300px"
                        data={dadosPizza}
                        options={{ pieHole: 0.4, colors: ['#4F46E5', '#10B981', '#F59E0B'] }}
                    />
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Histórico de Atendimentos</h3>
                    {dadosLinha.length > 1 ? (
                        <Chart
                            chartType="AreaChart"
                            width="100%"
                            height="300px"
                            data={dadosLinha}
                            options={{ legend: 'none', colors: ['#4F46E5'], areaOpacity: 0.2 }}
                        />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                            Sem dados temporais suficientes.
                        </div>
                    )}
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                    <Calendar size={20} /> Diário de Bordo
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Serviço</th>
                                <th className="px-4 py-3">Espécie</th>
                                <th className="px-4 py-3 text-right">Qtd</th>
                                <th className="px-4 py-3 text-right">Horas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.map((d, i) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">
                                        {d.data.includes('-') ? d.data.split('-').reverse().join('/') : d.data}
                                    </td>
                                    <td className="px-4 py-3">{d.servico}</td>
                                    <td className="px-4 py-3">{d.especie}</td>
                                    <td className="px-4 py-3 text-right">{d.quantidade}</td>
                                    <td className="px-4 py-3 text-right">{d.horas.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};