import { useState, useEffect, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useNavigate } from 'react-router-dom'
import './App.css'

interface Transaction {
    id: string
    date: string
    category: string
    amount: number
    memo: string
}

interface Settings {
    monthlyBudget: number
}

interface Achievement {
    yearMonth: string
    achieved: boolean
    totalExpense: number
    budget: number
}

function App() {
    const navigate = useNavigate()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [category, setCategory] = useState('')
    const [amount, setAmount] = useState('')
    const [memo, setMemo] = useState('')
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
    const [settings, setSettings] = useState<Settings>({ monthlyBudget: 0 })
    const [showSettings, setShowSettings] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Transaction | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [achievements, setAchievements] = useState<Achievement[]>([])

    const categories = ['現金', 'auペイ', 'クレジットカード', '交通費', 'その他']
    const categoryColors: { [key: string]: string } = {
        '現金': '#4CAF50',
        'auペイ': '#FF9800',
        'クレジットカード': '#2196F3',
        '交通費': '#9C27B0',
        'その他': '#95A5A6'
    }

    useEffect(() => {
        const saved = localStorage.getItem('transactions')
        if (saved) {
            setTransactions(JSON.parse(saved))
        }
        const savedSettings = localStorage.getItem('settings')
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings))
        }
        const savedAchievements = localStorage.getItem('achievements')
        if (savedAchievements) {
            setAchievements(JSON.parse(savedAchievements))
        }
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('transactions', JSON.stringify(transactions))
        }
    }, [transactions, isInitialized])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('settings', JSON.stringify(settings))
        }
    }, [settings, isInitialized])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('achievements', JSON.stringify(achievements))
        }
    }, [achievements, isInitialized])

    useEffect(() => {
        if (!isInitialized || settings.monthlyBudget === 0) return

        const now = new Date()
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date)
            return tDate.getFullYear() === now.getFullYear() && tDate.getMonth() === now.getMonth()
        })

        const monthTotal = monthTransactions.reduce((sum, t) => sum + t.amount, 0)

        const existingAchievement = achievements.find(a => a.yearMonth === currentYearMonth)

        if (!existingAchievement) {
            const newAchievement: Achievement = {
                yearMonth: currentYearMonth,
                achieved: monthTotal <= settings.monthlyBudget,
                totalExpense: monthTotal,
                budget: settings.monthlyBudget
            }
            setAchievements([...achievements, newAchievement])
        } else if (existingAchievement.totalExpense !== monthTotal || existingAchievement.budget !== settings.monthlyBudget) {
            setAchievements(achievements.map(a =>
                a.yearMonth === currentYearMonth
                    ? { ...a, achieved: monthTotal <= settings.monthlyBudget, totalExpense: monthTotal, budget: settings.monthlyBudget }
                    : a
            ))
        }
    }, [transactions, settings.monthlyBudget, isInitialized, achievements])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!category || !amount) return

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            date,
            category,
            amount: parseFloat(amount),
            memo
        }

        setTransactions([newTransaction, ...transactions])
        setCategory('')
        setAmount('')
        setMemo('')
    }

    const handleDelete = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id))
    }

    const handleEdit = (transaction: Transaction) => {
        setEditingId(transaction.id)
        setEditForm({ ...transaction })
    }

    const handleSaveEdit = () => {
        if (!editForm) return
        setTransactions(transactions.map(t => t.id === editingId ? editForm : t))
        setEditingId(null)
        setEditForm(null)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditForm(null)
    }

    const getFilteredTransactions = useMemo(() => {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        if (viewMode === 'month') {
            return transactions.filter(t => {
                const tDate = new Date(t.date)
                return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth
            })
        } else {
            const weekAgo = new Date(now)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return transactions.filter(t => new Date(t.date) >= weekAgo)
        }
    }, [transactions, viewMode])

    const getPreviousPeriodTransactions = useMemo(() => {
        const now = new Date()

        if (viewMode === 'month') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
            return transactions.filter(t => {
                const tDate = new Date(t.date)
                return tDate >= lastMonth && tDate <= lastMonthEnd
            })
        } else {
            const twoWeeksAgo = new Date(now)
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
            const weekAgo = new Date(now)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return transactions.filter(t => {
                const tDate = new Date(t.date)
                return tDate >= twoWeeksAgo && tDate < weekAgo
            })
        }
    }, [transactions, viewMode])

    const totalExpense = useMemo(() =>
        getFilteredTransactions.reduce((sum, t) => sum + t.amount, 0),
        [getFilteredTransactions]
    )

    const previousExpense = useMemo(() =>
        getPreviousPeriodTransactions.reduce((sum, t) => sum + t.amount, 0),
        [getPreviousPeriodTransactions]
    )

    const expenseDiff = totalExpense - previousExpense
    const expenseChangePercent = previousExpense > 0
        ? ((expenseDiff / previousExpense) * 100).toFixed(1)
        : '0'

    const categoryData = useMemo(() => {
        const grouped = getFilteredTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
        }, {} as { [key: string]: number })

        return Object.entries(grouped).map(([name, value]) => ({
            name,
            value,
            color: categoryColors[name],
            percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0
        })).sort((a, b) => b.value - a.value)
    }, [getFilteredTransactions, totalExpense])

    const budgetRemaining = settings.monthlyBudget - totalExpense
    const budgetPercentage = settings.monthlyBudget > 0
        ? (totalExpense / settings.monthlyBudget) * 100
        : 0

    const isOverBudget = budgetPercentage > 100
    const isWarning = budgetPercentage > 80 && !isOverBudget

    const dailyBudgetInfo = useMemo(() => {
        if (settings.monthlyBudget === 0 || viewMode !== 'month') return null

        const now = new Date()
        const currentDay = now.getDate()
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const remainingDays = daysInMonth - currentDay + 1

        const dailyBudget = settings.monthlyBudget / daysInMonth
        const budgetUsedSoFar = dailyBudget * currentDay
        const shouldHaveSpent = budgetUsedSoFar
        const actuallySpent = totalExpense
        const difference = actuallySpent - shouldHaveSpent

        const remainingBudget = settings.monthlyBudget - totalExpense
        const dailyAllowance = remainingDays > 0 ? remainingBudget / remainingDays : 0

        return {
            dailyBudget: Math.round(dailyBudget),
            dailyAllowance: Math.round(dailyAllowance),
            remainingDays,
            difference: Math.round(difference),
            isOverPace: difference > 0
        }
    }, [settings.monthlyBudget, totalExpense, viewMode])

    const highExpenses = useMemo(() =>
        getFilteredTransactions.filter(t => t.amount >= 7000),
        [getFilteredTransactions]
    )

    const topCategory = categoryData.length > 0 ? categoryData[0] : null

    const alerts = useMemo(() => {
        const alertList = []

        if (isOverBudget && settings.monthlyBudget > 0) {
            alertList.push({
                type: 'danger',
                icon: '🚨',
                title: '予算超過',
                message: `予算を¥${Math.abs(budgetRemaining).toLocaleString()}超過しています`
            })
        } else if (isWarning && settings.monthlyBudget > 0) {
            alertList.push({
                type: 'warning',
                icon: '⚠️',
                title: '予算警告',
                message: `予算の${budgetPercentage.toFixed(0)}%を使用しています`
            })
        }

        if (highExpenses.length > 0) {
            alertList.push({
                type: 'info',
                icon: '💰',
                title: '高額支出',
                message: `7,000円以上の支出が${highExpenses.length}件あります`
            })
        }

        if (topCategory && topCategory.percentage > 40) {
            alertList.push({
                type: 'info',
                icon: '📊',
                title: 'カテゴリ集中',
                message: `${topCategory.name}が支出の${topCategory.percentage.toFixed(0)}%を占めています`
            })
        }

        if (expenseDiff > 0 && previousExpense > 0) {
            const periodName = viewMode === 'month' ? '先月' : '先週'
            alertList.push({
                type: 'info',
                icon: '📈',
                title: '支出増加',
                message: `${periodName}より¥${expenseDiff.toLocaleString()}多く使っています`
            })
        }

        return alertList
    }, [isOverBudget, isWarning, budgetRemaining, budgetPercentage, highExpenses, topCategory, expenseDiff, previousExpense, viewMode, settings.monthlyBudget])

    return (
        <div className="app">
            <header>
                <h1>💳 支出管理</h1>
                <div className="header-actions">
                    <button className="stats-btn" onClick={() => navigate('/statistics')}>
                        📊
                    </button>
                    <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
                        ⚙️
                    </button>
                </div>
            </header>

            {showSettings && (
                <div className="settings-panel">
                    <h3>月間予算設定</h3>
                    <input
                        type="number"
                        value={settings.monthlyBudget || ''}
                        onChange={(e) => setSettings({ monthlyBudget: parseFloat(e.target.value) || 0 })}
                        placeholder="月間予算を入力"
                    />
                    <button onClick={() => setShowSettings(false)}>閉じる</button>
                </div>
            )}

            {alerts.length > 0 && (
                <div className="alerts">
                    {alerts.map((alert, index) => (
                        <div key={index} className={`alert alert-${alert.type}`}>
                            <span className="alert-icon">{alert.icon}</span>
                            <div className="alert-content">
                                <div className="alert-title">{alert.title}</div>
                                <div className="alert-message">{alert.message}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="view-toggle">
                <button
                    className={viewMode === 'month' ? 'active' : ''}
                    onClick={() => setViewMode('month')}
                >
                    今月
                </button>
                <button
                    className={viewMode === 'week' ? 'active' : ''}
                    onClick={() => setViewMode('week')}
                >
                    直近7日
                </button>
            </div>

            <div className="summary">
                <div className={`summary-main ${isOverBudget ? 'over' : isWarning ? 'warning' : ''}`}>
                    <span className="label">
                        {viewMode === 'month' ? '今月の支出' : '直近7日の支出'}
                    </span>
                    <span className="amount">¥{totalExpense.toLocaleString()}</span>

                    {previousExpense > 0 && (
                        <div className="comparison">
                            <span className={expenseDiff > 0 ? 'increase' : 'decrease'}>
                                {viewMode === 'month' ? '先月' : '先週'}比
                                {expenseDiff > 0 ? '+' : ''}¥{expenseDiff.toLocaleString()}
                                ({expenseDiff > 0 ? '+' : ''}{expenseChangePercent}%)
                            </span>
                        </div>
                    )}

                    {settings.monthlyBudget > 0 && viewMode === 'month' && (
                        <>
                            <div className="budget-bar">
                                <div
                                    className="budget-progress"
                                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                                />
                            </div>
                            <span className="budget-info">
                                {isOverBudget ? (
                                    <span className="over">予算超過 ¥{Math.abs(budgetRemaining).toLocaleString()}</span>
                                ) : (
                                    <span>残り ¥{budgetRemaining.toLocaleString()}</span>
                                )}
                                <span className="budget-total"> / ¥{settings.monthlyBudget.toLocaleString()}</span>
                            </span>
                        </>
                    )}
                </div>

                {dailyBudgetInfo && viewMode === 'month' && (
                    <div className="daily-budget-card">
                        <div className="daily-budget-header">
                            <span className="daily-icon">📅</span>
                            <span className="daily-title">今日使える金額</span>
                        </div>
                        <div className="daily-amount">
                            ¥{dailyBudgetInfo.dailyAllowance.toLocaleString()}
                        </div>
                        <div className="daily-details">
                            <span>残り{dailyBudgetInfo.remainingDays}日</span>
                            {dailyBudgetInfo.isOverPace && (
                                <span className="over-pace">
                                    ペースオーバー ¥{Math.abs(dailyBudgetInfo.difference).toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {categoryData.length > 0 && (
                <div className="chart-container">
                    <h2>カテゴリ別内訳</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number | undefined) => `¥${(value || 0).toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="category-list">
                        {categoryData.map(cat => (
                            <div key={cat.name} className="category-item">
                                <span className="category-color" style={{ backgroundColor: cat.color }} />
                                <span className="category-name">{cat.name}</span>
                                <span className="category-amount">¥{cat.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="input-form">
                <div className="form-group">
                    <label>日付</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>カテゴリ</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">選択してください</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>金額</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>メモ</label>
                    <input
                        type="text"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="メモ（任意）"
                    />
                </div>

                <button type="submit" className="submit-btn">
                    追加
                </button>
            </form>

            <div className="transactions">
                <h2>履歴</h2>
                {getFilteredTransactions.length === 0 ? (
                    <p className="empty">データがありません</p>
                ) : (
                    <ul>
                        {getFilteredTransactions.map(t => (
                            <li key={t.id} className="transaction">
                                {editingId === t.id && editForm ? (
                                    <div className="edit-form">
                                        <div className="edit-row">
                                            <input
                                                type="date"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                            />
                                            <select
                                                value={editForm.category}
                                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="edit-row">
                                            <input
                                                type="number"
                                                value={editForm.amount}
                                                onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                                            />
                                            <input
                                                type="text"
                                                value={editForm.memo}
                                                onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                                                placeholder="メモ"
                                            />
                                        </div>
                                        <div className="edit-actions">
                                            <button onClick={handleSaveEdit} className="save-btn">保存</button>
                                            <button onClick={handleCancelEdit} className="cancel-btn">キャンセル</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
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
                                            <div className="transaction-actions">
                                                <button
                                                    onClick={() => handleEdit(t)}
                                                    className="edit-btn"
                                                >
                                                    編集
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="delete-btn"
                                                >
                                                    削除
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default App
