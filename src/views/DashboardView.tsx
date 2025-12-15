import React, { useMemo } from 'react';
import { Chart } from "react-google-charts";
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useDashboardController } from '../controllers/useDashboardController';

export const DashboardView: React.FC = () => {
    const {
        atendimentos, isLoading, handleFileUpload,
        filtroLocal, setFiltroLocal, locaisDisponiveis,
        dadosGraficoBarras, dadosGraficoLinha,
        dadosGraficoScatter, dadosGraficoPizza
    } = useDashboardController();

    const temDados = atendimentos.length > 0;

    // --- PREPARAÇÃO DOS DADOS ---

    // 1. Barras (Simplificado para evitar erro)
    const dadosBarraGoogle = useMemo(() => {
        // Cabeçalho simples: Localidade, Quantidade
        const header = [["Localidade", "Total Atendimentos"]];
        // Ordena do maior para o menor para ficar bonito
        const body = dadosGraficoBarras
            .sort((a: any, b: any) => b.total - a.total)
            .slice(0, 15) // Pega apenas os TOP 15 para não travar a tela
            .map((d: any) => [d.nome, d.total]);
        return header.concat(body);
    }, [dadosGraficoBarras]);

    // 2. Linha
    const dadosLinhaGoogle = useMemo(() => {
        const header = [["Data", "Qtd Animais"]];
        const body = dadosGraficoLinha.map((d: any) => [
            d.data.split('-').slice(1).reverse().join('/'),
            d.quantidade
        ]);
        return header.concat(body);
    }, [dadosGraficoLinha]);

    // 3. Bolhas
    const dadosBubbleGoogle = useMemo(() => {
        const header = [["ID", "Qtd Estoque (X)", "Custo Unitário (Y)", "Categoria", "Valor Total"]];
        const body = dadosGraficoScatter.map((d: any) => [
            d.name, d.x, d.y, "Insumos", d.z
        ]);
        return header.concat(body);
    }, [dadosGraficoScatter]);

    // 4. Pizza
    const dadosPizzaGoogle = useMemo(() => {
        const header = [["Raça", "Doses"]];
        const body = dadosGraficoPizza.map((d: any) => [d.raca, d.quantidadeDoses]);
        return header.concat(body);
    }, [dadosGraficoPizza]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-8">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">SAD - Gestão Rural Jeceaba</h1>
                    <p className="text-gray-600">Sistema de Apoio à Decisão (Google Charts)</p>
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

            {isLoading && (
                <div className="text-center py-20">
                    <p className="text-xl text-blue-600 animate-pulse">Processando arquivo...</p>
                </div>
            )}

            {!temDados && !isLoading && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-20 text-center bg-white">
                    <FileSpreadsheet size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700">Aguardando Dados</h2>
                    <p className="text-gray-500">Faça o upload do arquivo Atendimentos.csv ou Perfil dos Produtores.csv.</p>
                </div>
            )}

            {temDados && !isLoading && (
                <>
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border-l-4 border-blue-500 flex items-center gap-4">
                        <span className="font-semibold text-gray-700">Filtro Localidade:</span>
                        <select
                            value={filtroLocal}
                            onChange={(e) => setFiltroLocal(e.target.value)}
                            className="border border-gray-300 p-2 rounded"
                        >
                            <option value="Todos">Todas as Localidades</option>
                            {locaisDisponiveis.map(local => (
                                <option key={local} value={local}>{local}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">

                        {/* 1. TOP 15 LOCALIDADES (BARRAS HORIZONTAIS) */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Top 15 Localidades (Demandas)</h2>
                            <Chart
                                chartType="BarChart" // Mudado para horizontal para ler melhor os nomes
                                width="100%"
                                height="350px"
                                data={dadosBarraGoogle}
                                options={{
                                    legend: { position: "none" },
                                    hAxis: { title: "Total de Atendimentos" },
                                    vAxis: { title: "Localidade" },
                                    colors: ["#4F46E5"]
                                }}
                            />
                        </div>

                        {/* 2. EVOLUÇÃO TEMPORAL */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Evolução Temporal (Simulada)</h2>
                            <Chart
                                chartType="LineChart"
                                width="100%"
                                height="350px"
                                data={dadosLinhaGoogle}
                                options={{
                                    curveType: "function",
                                    legend: { position: "bottom" },
                                    pointSize: 4,
                                    colors: ["#10B981"],
                                    hAxis: { title: "Data" }
                                }}
                            />
                        </div>

                        {/* 3. FINANCEIRO (BOLHAS) */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Financeiro (Estoque x Custo)</h2>
                            <Chart
                                chartType="BubbleChart"
                                width="100%"
                                height="350px"
                                data={dadosBubbleGoogle}
                                options={{
                                    colorAxis: { colors: ['#8884d8'] },
                                    hAxis: { title: "Quantidade em Estoque" },
                                    vAxis: { title: "Custo Unitário" },
                                    bubble: { textStyle: { fontSize: 10 } }
                                }}
                            />
                        </div>

                        {/* 4. GENÉTICA (PIZZA) */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Perfil Genético</h2>
                            <Chart
                                chartType="PieChart"
                                width="100%"
                                height="350px"
                                data={dadosPizzaGoogle}
                                options={{
                                    pieHole: 0.4,
                                    legend: { position: 'right' },
                                    colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
                                }}
                            />
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};