import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell
} from 'recharts';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useDashboardController } from '../controllers/useDashboardController';

const CORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const DashboardView: React.FC = () => {
    const {
        atendimentos, isLoading, handleFileUpload,
        filtroLocal, setFiltroLocal, locaisDisponiveis,
        dadosGraficoBarras, dadosGraficoLinha,
        dadosGraficoScatter, dadosGraficoPizza
    } = useDashboardController();

    const temDados = atendimentos.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-8">
            {/* --- CABEÇALHO --- */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">SAD - Gestão Rural Jeceaba</h1>
                    <p className="text-gray-600">Sistema de Apoio à Decisão</p>
                </div>

                <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm">
                        <Upload size={20} />
                        <span className="font-medium">Carregar CSV</span>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </header>

            {/* --- ESTADO 1: CARREGANDO --- */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-xl text-blue-600 animate-pulse">Processando arquivo...</p>
                </div>
            )}

            {/* --- ESTADO 2: SEM DADOS (INSTRUÇÕES) --- */}
            {!temDados && !isLoading && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-20 text-center bg-white shadow-sm">
                    <div className="flex justify-center mb-4">
                        <FileSpreadsheet size={64} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Aguardando Dados</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Faça o upload do seu arquivo CSV para visualizar os indicadores.
                    </p>
                </div>
            )}

            {/* --- ESTADO 3: DASHBOARD COMPLETO --- */}
            {temDados && !isLoading && (
                <>
                    {/* BARRA DE FILTROS */}
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border-l-4 border-blue-500 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Filtro Localidade:</span>
                            <select
                                value={filtroLocal}
                                onChange={(e) => setFiltroLocal(e.target.value)}
                                className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[200px]"
                            >
                                <option value="Todos">Todas as Localidades</option>
                                {locaisDisponiveis.map(local => (
                                    <option key={local} value={local}>{local}</option>
                                ))}
                            </select>
                        </div>
                        <span className="text-sm text-gray-500 hidden sm:inline">|</span>
                        <span className="text-sm text-gray-500">
                            Registros analisados: <strong>{atendimentos.length}</strong>
                        </span>
                    </div>

                    {/* GRID DE GRÁFICOS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">

                        {/* GRÁFICO 1: BARRAS */}
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 min-w-0">
                            <h2 className="text-xl font-bold mb-1 text-gray-800">Demandas por Localidade</h2>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dadosGraficoBarras}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="nome"
                                            tick={{ fontSize: 11 }}
                                            interval={0}
                                            height={60}
                                            angle={-15}
                                            textAnchor="end"
                                        />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                        <Bar dataKey="total" fill="#4F46E5" name="Serviços" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* GRÁFICO 2: LINHA */}
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 min-w-0">
                            <h2 className="text-xl font-bold mb-1 text-gray-800">Linha do Tempo</h2>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dadosGraficoLinha}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="data"
                                            tickFormatter={(d) => {
                                                // Formata 2025-01-30 para 30/01
                                                try {
                                                    return d.split('-').slice(1).reverse().join('/');
                                                } catch { return d; }
                                            }}
                                        />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString('pt-BR')} />
                                        <Legend />
                                        <Line type="monotone" dataKey="quantidade" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Qtd" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* GRÁFICO 3: SCATTER */}
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 min-w-0">
                            <h2 className="text-xl font-bold mb-1 text-gray-800">Financeiro (Estoque)</h2>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid />
                                        <XAxis type="number" dataKey="x" name="Qtd" unit=" un" />
                                        <YAxis type="number" dataKey="y" name="Custo" unit=" R$" />
                                        <ZAxis type="number" dataKey="z" range={[60, 500]} name="Total" />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Insumos" data={dadosGraficoScatter} fill="#8884d8" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* GRÁFICO 4: PIZZA (CORRIGIDO) */}
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 min-w-0">
                            <h2 className="text-xl font-bold mb-1 text-gray-800">Genética (Raças)</h2>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dadosGraficoPizza as any[]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            // CORREÇÃO AQUI: String() blinda contra valores invalidos e nameKey avisa qual campo usar
                                            label={({ name, percent }: { name?: any; percent?: number }) =>
                                                `${String(name || '').substring(0, 10)} ${(percent ?? 0) * 100 > 5 ? ((percent ?? 0) * 100).toFixed(0) + '%' : ''}`
                                            }
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="quantidadeDoses"
                                            nameKey="raca" // <--- Importante: Diz pro grafico que o nome está no campo 'raca'
                                        >
                                            {dadosGraficoPizza.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};