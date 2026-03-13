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

function AnalyticsPanel({analytics}){

if(!analytics) return null;

const categoryData = {

labels:Object.keys(analytics.category_counts),

datasets:[{

label:"Complaints",

data:Object.values(analytics.category_counts),

backgroundColor:[
"#22c55e",
"#3b82f6",
"#f59e0b",
"#ef4444",
"#a855f7",
"#06b6d4"
]

}]

}

const dailyData={

labels:Object.keys(analytics.daily_counts),

datasets:[{

label:"Daily complaints",

data:Object.values(analytics.daily_counts),

backgroundColor:"#3b82f6"

}]

}

return(

<div className="analytics-grid">

<div className="chart-card">

<h3>Complaints by Category</h3>

<Pie data={categoryData}/>

</div>

<div className="chart-card">

<h3>Daily Trend</h3>

<Bar data={dailyData}/>

</div>

</div>

)

}

export default AnalyticsPanel