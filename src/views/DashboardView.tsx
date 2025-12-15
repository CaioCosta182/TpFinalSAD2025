import React, { useMemo } from 'react';
import { Chart } from "react-google-charts";
import { Upload, FileSpreadsheet, Trophy, Clock, MapPin, TrendingUp, Activity } from 'lucide-react';
import { useDashboardController } from '../controllers/useDashboardController';

export const DashboardView: React.FC = () => {
    const {
        atendimentos, isLoading, handleFileUpload,
        filtroLocal, setFiltroLocal, locaisDisponiveis,
        rankingProdutores, destaquePorRegiao,
        dadosGraficoBarras, dadosGraficoLinha,
        dadosGraficoScatter, dadosGraficoPizza
    } = useDashboardController();

    const temDados = atendimentos.length > 0;
    const top1Produtor = rankingProdutores[0];

    // --- GOOGLE CHARTS ---
    const dadosBarraGoogle = useMemo(() => {
        const header = [["Localidade", "Total Atendimentos"]];
        const body = dadosGraficoBarras
            .sort((a: any, b: any) => b.total - a.total)
            .slice(0, 15)
            .map((d: any) => [d.nome, d.total]);
        return header.concat(body);
    }, [dadosGraficoBarras]);

    const dadosLinhaGoogle = useMemo(() => {
        const header = [["Data", "Qtd Animais"]];
        const body = dadosGraficoLinha.map((d: any) => {
            // Formatação Robusta: Aceita YYYY-MM-DD e transforma em DD/MM para exibir
            let labelData = d.data;
            if (d.data.includes('-')) {
                labelData = d.data.split('-').slice(1).reverse().join('/');
            }
            return [labelData, d.quantidade];
        });
        return header.concat(body);
    }, [dadosGraficoLinha]);

    const dadosBubbleGoogle = useMemo(() => {
        const header = [["ID", "Qtd Estoque", "Custo Unit", "Cat", "Total"]];
        const body = dadosGraficoScatter.map((d: any) => [d.name, d.x, d.y, "Insumos", d.z]);
        return header.concat(body);
    }, [dadosGraficoScatter]);

    const dadosPizzaGoogle = useMemo(() => {
        const header = [["Raça", "Doses"]];
        const body = dadosGraficoPizza.map((d: any) => [d.raca, d.quantidadeDoses]);
        return header.concat(body);
    }, [dadosGraficoPizza]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-8">
            <header className="mb-8 flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">SAD - Gestão Rural Jeceaba</h1>
                    <p className="text-gray-600">Sistema de Apoio à Decisão</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm">
                        <Upload size={20} />
                        <span className="font-medium">Carregar CSV Original</span>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
            </header>

            {isLoading && <div className="text-center py-20"><p className="text-xl text-blue-600 animate-pulse">Calculando métricas...</p></div>}

            {!temDados && !isLoading && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-20 text-center bg-white">
                    <FileSpreadsheet size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700">Aguardando Dados</h2>
                    <p className="text-gray-500">Carregue o CSV para visualizar o Dashboard.</p>
                </div>
            )}

            {temDados && !isLoading && (
                <>
                    {/* DESTAQUES E KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-400 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase">Produtor Destaque</p>
                                    <h3 className="text-xl font-bold text-gray-800 mt-1 truncate max-w-[200px]" title={top1Produtor?.nome}>
                                        {top1Produtor ? top1Produtor.nome : "N/A"}
                                    </h3>
                                    <p className="text-sm text-gray-500">{top1Produtor?.local}</p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-full"><Trophy className="text-yellow-600" size={24} /></div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-lg w-fit">
                                <TrendingUp size={16} />
                                <span className="font-bold">{top1Produtor ? top1Produtor.visitas : 0} visitas</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-400 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase">Horas Técnicas (Top 1)</p>
                                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{top1Produtor ? top1Produtor.horas.toFixed(1) : 0} h</h3>
                                    <p className="text-sm text-gray-500">Dedicadas a este produtor</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-full"><Clock className="text-blue-600" size={24} /></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-400 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase">Regiões Atendidas</p>
                                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{destaquePorRegiao.length}</h3>
                                    <p className="text-sm text-gray-500">Localidades com visitas</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full"><MapPin className="text-green-600" size={24} /></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border-l-4 border-blue-500 flex items-center gap-4">
                        <span className="font-semibold text-gray-700">Filtro Localidade:</span>
                        <select value={filtroLocal} onChange={(e) => setFiltroLocal(e.target.value)} className="border border-gray-300 p-2 rounded">
                            <option value="Todos">Todas as Localidades</option>
                            {locaisDisponiveis.map(local => (<option key={local} value={local}>{local}</option>))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Demandas por Localidade (Top 15)</h2>
                            <Chart chartType="BarChart" width="100%" height="300px" data={dadosBarraGoogle} options={{ legend: "none", hAxis: { title: "Atendimentos" }, colors: ["#4F46E5"] }} />
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Evolução Temporal</h2>
                            <Chart chartType="LineChart" width="100%" height="300px" data={dadosLinhaGoogle} options={{ legend: "bottom", colors: ["#10B981"], pointSize: 4 }} />
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Financeiro (Estoque x Custo)</h2>
                            <Chart chartType="BubbleChart" width="100%" height="300px" data={dadosBubbleGoogle} options={{ colorAxis: { colors: ['#8884d8'] }, hAxis: { title: "Quantidade em Estoque" }, vAxis: { title: "Custo Unitário" }, bubble: { textStyle: { fontSize: 10 } } }} />
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Perfil Genético</h2>
                            <Chart chartType="PieChart" width="100%" height="300px" data={dadosPizzaGoogle} options={{ pieHole: 0.4, legend: { position: 'right' } }} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                            <Activity size={20} className="text-blue-600" /> Destaques: Melhor Produtor por Região
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">Região</th>
                                        <th className="px-6 py-3">Principal Produtor</th>
                                        <th className="px-6 py-3 text-right">Visitas Realizadas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {destaquePorRegiao.slice(0, 10).map((d, idx) => (
                                        <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{d.regiao}</td>
                                            <td className="px-6 py-4">{d.campeao}</td>
                                            <td className="px-6 py-4 text-right font-bold text-blue-600">{d.visitas}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {destaquePorRegiao.length > 10 && <p className="text-xs text-gray-400 mt-2 text-center">Exibindo top 10.</p>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};