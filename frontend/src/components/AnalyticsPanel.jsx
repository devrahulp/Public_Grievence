import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

const CATEGORY_COLORS = [
    "#4f8fff", "#38e9b4", "#f59e0b", "#f87171",
    "#a78bfa", "#06b6d4", "#ec4899", "#84cc16", "#f97316"
];

function AnalyticsPanel({ analytics }) {

    if (!analytics) return null;

    const categoryData = {
        labels: Object.keys(analytics.category_counts),
        datasets: [{
            label: "Complaints",
            data: Object.values(analytics.category_counts),
            backgroundColor: CATEGORY_COLORS.slice(0, Object.keys(analytics.category_counts).length),
            borderWidth: 0,
        }]
    };

    const dailyData = {
        labels: Object.keys(analytics.daily_counts),
        datasets: [{
            label: "Daily complaints",
            data: Object.values(analytics.daily_counts),
            backgroundColor: "rgba(79,143,255,0.6)",
            borderColor: "#4f8fff",
            borderWidth: 1,
            borderRadius: 4,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#8b9cc7",
                    font: { family: "'DM Sans', sans-serif", size: 11 }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: "#4f5f87", font: { size: 10 } },
                grid: { color: "rgba(99,155,255,0.06)" }
            },
            y: {
                ticks: { color: "#4f5f87", font: { size: 10 } },
                grid: { color: "rgba(99,155,255,0.06)" }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#8b9cc7",
                    font: { family: "'DM Sans', sans-serif", size: 11 },
                    padding: 14,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                }
            }
        }
    };

    return (
        <>
            <div className="chart-card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Daily Complaint Trend</div>
                        <div className="card-subtitle">Complaints filed per day</div>
                    </div>
                    <span className="card-tag">Bar Chart</span>
                </div>
                <div style={{ height: "200px" }}>
                    <Bar data={dailyData} options={chartOptions} />
                </div>
            </div>

            <div className="chart-card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Category Distribution</div>
                        <div className="card-subtitle">Complaints by issue type</div>
                    </div>
                    <span className="card-tag">Pie Chart</span>
                </div>
                <div style={{ height: "200px" }}>
                    <Pie data={categoryData} options={pieOptions} />
                </div>
            </div>
        </>
    );
}

export default AnalyticsPanel;