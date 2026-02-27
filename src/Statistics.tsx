import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'
import './Statistics.css'

interface Transaction {
    id: string
    date: string
    category: string
    amount: number
    memo: string
}

interface Achievement {
    yearMonth: string
    achieved: boolean
    totalExpense: number
    budget: number
}

function Statistics() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('transactions')
        if (saved) {
            setTransactions(JSON.parse(saved))
        }
        const savedAchievements = localStorage.getItem('achievements')
        if (savedAchievements) {
            setAchievements(JSON.parse(savedAchievements))
        }
    }, [])

    const availableYears = useMemo(() => {
        const years = new Set<number>()
        transactions.forEach(t => {
            const year = new Date(t.date).getFullYear()
            years.add(year)
        })
        return Array.from(years).sort((a, b) => b - a)
    }, [transactions])

    const monthlyData = useMemo(() => {
        const months = [
            '1月', '2月', '3月', '4月', '5月', '6月',
            '7月', '8月', '9月', '10月', '11月', '12月'
        ]

        const data = months.map((month, index) => {
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date)
                return tDate.getFullYear() === selectedYear && tDate.getMonth() === index
            })

            const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0)

            return {
                month,
                amount: total,
                count: monthTransactions.length
            }
        })

        return data
    }, [transactions, selectedYear])

    const yearlyTotal = useMemo(() =>
        monthlyData.reduce((sum, m) => sum + m.amount, 0),
        [monthlyData]
    )

    const yearlyAverage = useMemo(() => {
        const monthsWithData = monthlyData.filter(m => m.amount > 0).length
        return monthsWithData > 0 ? yearlyTotal / monthsWithData : 0
    }, [monthlyData, yearlyTotal])

    const maxMonth = useMemo(() => {
        const max = monthlyData.reduce((prev, current) =>
            current.amount > prev.amount ? current : prev
        )
        return max.amount > 0 ? max : null
    }, [monthlyData])

    const minMonth = useMemo(() => {
        const withData = monthlyData.filter(m => m.amount > 0)
        if (withData.length === 0) return null
        return withData.reduce((prev, current) =>
            current.amount < prev.amount ? current : prev
        )
    }, [monthlyData])

    const selectedMonthTransactions = useMemo(() => {
        if (selectedMonth === null) return []
        return transactions.filter(t => {
            const tDate = new Date(t.date)
            return tDate.getFullYear() === selectedYear && tDate.getMonth() === selectedMonth
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }, [transactions, selectedYear, selectedMonth])

    const categoryColors: { [key: string]: string } = {
        '現金': '#4CAF50',
        'auペイ': '#FF9800',
        'クレジットカード': '#2196F3',
        '交通費': '#9C27B0',
        'その他': '#95A5A6'
    }

    const selectedMonthCategoryData = useMemo(() => {
        if (selectedMonth === null) return []
        const grouped = selectedMonthTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
        }, {} as { [key: string]: number })

        return Object.entries(grouped).map(([name, value]) => ({
            name,
            value,
            color: categoryColors[name] || '#95A5A6'
        })).sort((a, b) => b.value - a.value)
    }, [selectedMonthTransactions, selectedMonth])

    const handleMonthClick = (monthIndex: number) => {
        if (selectedMonth === monthIndex) {
            setSelectedMonth(null)
        } else {
            setSelectedMonth(monthIndex)
        }
    }

    const handleDelete = (id: string) => {
        const updated = transactions.filter(t => t.id !== id)
        setTransactions(updated)
        localStorage.setItem('transactions', JSON.stringify(updated))
    }

    const recentAchievements = useMemo(() => {
        return achievements
            .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
            .slice(0, 3)
    }, [achievements])

    const achievementStreak = useMemo(() => {
        let streak = 0
        const sorted = [...achievements].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
        for (const achievement of sorted) {
            if (achievement.achieved) {
                streak++
            } else {
                break
            }
        }
        return streak
    }, [achievements])

    return (
        <div className="statistics">
            <header>
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← 戻る
                </button>
                <h1>📊 年間統計</h1>
                <div style={{ width: '40px' }} />
            </header>

            <div className="year-selector">
                <label>表示年</label>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                    {availableYears.length > 0 ? (
                        availableYears.map(year => (
                            <option key={year} value={year}>{year}年</option>
                        ))
                    ) : (
                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}年</option>
                    )}
                </select>
            </div>

            {recentAchievements.length > 0 && (
                <div className="achievements-section">
                    <h3>🏆 目標達成記録</h3>
                    {achievementStreak > 0 && (
                        <div className="streak-badge">
                            🔥 {achievementStreak}ヶ月連続達成中！
                        </div>
                    )}
                    <div className="achievements-grid">
                        {recentAchievements.map(achievement => (
                            <div
                                key={achievement.yearMonth}
                                className={`achievement-badge ${achievement.achieved ? 'achieved' : 'over'}`}
                            >
                                <div className="badge-icon">
                                    {achievement.achieved ? '✅' : '📊'}
                                </div>
                                <div className="badge-label">
                                    {achievement.achieved ? '達成' : '超過'}
                                </div>
                                <div className="badge-month">
                                    {achievement.yearMonth.split('-')[1]}月
                                </div>
                                <div className="badge-amount">
                                    ¥{achievement.totalExpense.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="stats-summary">
                <div className="stat-card">
                    <span className="stat-label">年間合計</span>
                    <span className="stat-value">¥{yearlyTotal.toLocaleString()}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">月平均</span>
                    <span className="stat-value">¥{Math.round(yearlyAverage).toLocaleString()}</span>
                </div>
            </div>

            {maxMonth && minMonth && (
                <div className="stats-insights">
                    <div className="insight-card">
                        <span className="insight-icon">📈</span>
                        <div className="insight-content">
                            <div className="insight-title">最高額の月</div>
                            <div className="insight-value">
                                {maxMonth.month}: ¥{maxMonth.amount.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="insight-card">
                        <span className="insight-icon">📉</span>
                        <div className="insight-content">
                            <div className="insight-title">最低額の月</div>
                            <div className="insight-value">
                                {minMonth.month}: ¥{minMonth.amount.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="chart-section">
                <h2>月別支出推移</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                            formatter={(value: number | undefined) => `¥${(value || 0).toLocaleString()}`}
                            labelStyle={{ color: '#333' }}
                        />
                        <Legend />
                        <Bar
                            dataKey="amount"
                            fill="#667eea"
                            name="支出額"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="monthly-details">
                <h2>月別詳細</h2>
                <p className="details-hint">💡 月をクリックすると詳細が表示されます</p>
                <div className="details-list">
                    {monthlyData.map((data, index) => (
                        <div key={index}>
                            <div
                                className={`detail-item ${selectedMonth === index ? 'active' : ''}`}
                                onClick={() => handleMonthClick(index)}
                            >
                                <div className="detail-month">
                                    {data.month}
                                    {selectedMonth === index && <span className="expand-icon"> ▼</span>}
                                    {selectedMonth !== index && data.amount > 0 && <span className="expand-icon"> ▶</span>}
                                </div>
                                <div className="detail-info">
                                    <div className="detail-amount">¥{data.amount.toLocaleString()}</div>
                                    <div className="detail-count">{data.count}件</div>
                                </div>
                            </div>

                            {selectedMonth === index && selectedMonthTransactions.length > 0 && (
                                <div className="month-detail-content">
                                    {selectedMonthCategoryData.length > 0 && (
                                        <div className="month-chart">
                                            <h3>カテゴリ別内訳</h3>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={selectedMonthCategoryData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {selectedMonthCategoryData.map((entry, idx) => (
                                                            <Cell key={`cell-${idx}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value: number | undefined) => `¥${(value || 0).toLocaleString()}`} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="category-list">
                                                {selectedMonthCategoryData.map(cat => (
                                                    <div key={cat.name} className="category-item">
                                                        <span className="category-color" style={{ backgroundColor: cat.color }} />
                                                        <span className="category-name">{cat.name}</span>
                                                        <span className="category-amount">¥{cat.value.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="month-transactions">
                                        <h3>履歴（{selectedMonthTransactions.length}件）</h3>
                                        <ul>
                                            {selectedMonthTransactions.map(t => (
                                                <li key={t.id} className="transaction">
                                                    <div className="transaction-info">
                                                        <div className="transaction-header">
                                                            <span className="date">{t.date}</span>
                                                            <span className="category">{t.category}</span>
                                                        </div>
                                                        {t.memo && <div className="memo">{t.memo}</div>}
                                                    </div>
                                                    <div className="transaction-amount">
                                                        <span className={t.amount >= 7000 ? 'high-amount' : ''}>
                                                            ¥{t.amount.toLocaleString()}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDelete(t.id)
                                                            }}
                                                            className="delete-btn"
                                                        >
                                                            削除
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Statistics
