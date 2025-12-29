import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trash2, DollarSign, TrendingUp } from 'lucide-react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const BudgetTracker: React.FC = () => {
    const { user } = useAuth();
    const [budgetData, setBudgetData] = useState<any>(null);
    const [newExpense, setNewExpense] = useState({ category: 'Food', amount: '', description: '', date: '' });
    const [budgetInput, setBudgetInput] = useState('');
    const [dates, setDates] = useState({ start: '', end: '' });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    useEffect(() => {
        if (user) {
            fetchBudget();
        }
    }, [user]);

    const fetchBudget = async () => {
        try {
            const res = await api.get(`/budget/${user?._id}`);
            const data = res.data;
            setBudgetData(data);
            setBudgetInput(data.totalBudget);
            if (data.tripStartDate && data.tripEndDate) {
                setDates({
                    start: data.tripStartDate.split('T')[0],
                    end: data.tripEndDate.split('T')[0]
                });
            }
        } catch (error) {
            console.error("Error fetching budget:", error);
            // It's possible budget doesn't exist yet, which is fine
        }
    };

    const handleSetBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/budget', {
                userId: user?._id,
                totalBudget: Number(budgetInput),
                tripStartDate: dates.start,
                tripEndDate: dates.end
            });
            setBudgetData(res.data);
        } catch (error) {
            console.error("Error setting budget:", error);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post(`/budget/${user?._id}/expenses`, newExpense);
            setBudgetData(res.data);
            setNewExpense({ category: 'Food', amount: '', description: '', date: '' });
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };

    const deleteExpense = async (expenseId: string) => {
        try {
            const res = await api.delete(`/budget/${user?._id}/expenses/${expenseId}`);
            setBudgetData(res.data);
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    // Calculations
    const totalSpent = budgetData?.expenses?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
    const remaining = (budgetData?.totalBudget || 0) - totalSpent;
    const progress = budgetData?.totalBudget ? (totalSpent / budgetData.totalBudget) * 100 : 0;

    // Safe to Spend Calculation based on days remaining
    const calculateDailyBudget = () => {
        if (!budgetData?.tripEndDate || remaining <= 0) return 0;
        const end = new Date(budgetData.tripEndDate);
        const now = new Date();
        const diffTime = Math.abs(end.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? (remaining / diffDays).toFixed(2) : 0;
    };

    // Prepare Chart Data
    const chartData = budgetData?.expenses?.reduce((acc: any[], curr: any) => {
        const found = acc.find(item => item.name === curr.category);
        if (found) {
            found.value += curr.amount;
        } else {
            acc.push({ name: curr.category, value: curr.amount });
        }
        return acc;
    }, []) || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <DollarSign className="text-green-600" /> Trip Budget Planner
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Budget Setup & Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Budget Overview</h2>
                        <form onSubmit={handleSetBudget} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Budget</label>
                                <input
                                    type="number"
                                    value={budgetInput}
                                    onChange={(e) => setBudgetInput(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="e.g. 5000"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Arrival</label>
                                    <input type="date" value={dates.start} onChange={e => setDates({ ...dates, start: e.target.value })} className="mt-1 w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Departure</label>
                                    <input type="date" value={dates.end} onChange={e => setDates({ ...dates, end: e.target.value })} className="mt-1 w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                            </div>
                            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold">Update Budget</button>
                        </form>

                        {budgetData && (
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-600">Spent: ${totalSpent}</span>
                                    <span className={`font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>Remaining: ${remaining}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-2.5 rounded-full ${remaining < 0 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                </div>

                                {/* Safe to Spend Widget */}
                                {remaining > 0 && dates.end && (
                                    <div className="mt-4 bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-3">
                                        <TrendingUp className="text-green-600" />
                                        <div>
                                            <div className="text-sm text-green-800 font-medium">Safe User Daily Spend</div>
                                            <div className="text-xl font-bold text-green-700">${calculateDailyBudget()} / day</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Analytics */}
                    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[300px]">
                        <h2 className="text-xl font-semibold mb-4 w-full text-gray-800">Expense Distribution</h2>
                        {chartData.length > 0 ? (
                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label
                                        >
                                            {chartData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center flex flex-col items-center">
                                <DollarSign size={48} className="mb-2 opacity-50" />
                                Add expenses to see visualization
                            </div>
                        )}
                    </div>

                    {/* Add Expense Form */}
                    <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Expense</h2>
                        <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    {['Food', 'Transport', 'Lodging', 'Activities', 'Shopping', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <input type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) as any })} className="mt-1 w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0.00" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <input type="text" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} className="mt-1 w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Dinner" />
                            </div>
                            <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 font-semibold shadow">Add</button>
                        </form>
                    </div>

                    {/* Recent Expenses List */}
                    <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Expense History</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-gray-600 bg-gray-50">
                                        <th className="pb-3 pt-3 pl-2">Category</th>
                                        <th className="pb-3 pt-3">Description</th>
                                        <th className="pb-3 pt-3">Date</th>
                                        <th className="pb-3 pt-3">Amount</th>
                                        <th className="pb-3 pt-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {budgetData?.expenses?.map((exp: any) => (
                                        <tr key={exp._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-2 font-medium">{exp.category}</td>
                                            <td className="py-3 text-gray-600">{exp.description}</td>
                                            <td className="py-3 text-gray-500">{new Date(exp.date).toLocaleDateString()}</td>
                                            <td className="py-3 font-medium text-gray-800">${exp.amount}</td>
                                            <td className="py-3">
                                                <button onClick={() => deleteExpense(exp._id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!budgetData?.expenses || budgetData.expenses.length === 0) && (
                                <p className="text-center text-gray-500 py-8 italic bg-gray-50 rounded mt-2">No expenses recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetTracker;
