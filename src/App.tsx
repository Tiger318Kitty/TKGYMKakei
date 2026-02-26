import { useState, useEffect } from 'react'
import './App.css'

interface Transaction {
    id: string
    date: string
    category: string
    amount: number
    type: 'income' | 'expense'
    memo: string
}

function App() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [category, setCategory] = useState('')
    const [amount, setAmount] = useState('')
    const [type, setType] = useState<'income' | 'expense'>('expense')
    const [memo, setMemo] = useState('')

    const categories = {
        expense: ['食費', '交通費', '日用品', '娯楽', '医療', 'その他'],
        income: ['給与', '副業', 'その他']
    }

    useEffect(() => {
        const saved = localStorage.getItem('transactions')
        if (saved) {
            setTransactions(JSON.parse(saved))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions))
    }, [transactions])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!category || !amount) return

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            date,
            category,
            amount: parseFloat(amount),
            type,
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

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    return (
        <div className="app">
            <header>
                <h1>💰 家計簿</h1>
            </header>

            <div className="summary">
                <div className="summary-item income">
                    <span>収入</span>
                    <span>¥{totalIncome.toLocaleString()}</span>
                </div>
                <div className="summary-item expense">
                    <span>支出</span>
                    <span>¥{totalExpense.toLocaleString()}</span>
                </div>
                <div className="summary-item balance">
                    <span>残高</span>
                    <span>¥{balance.toLocaleString()}</span>
                </div>
            </div>

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
                    <label>種類</label>
                    <div className="type-selector">
                        <button
                            type="button"
                            className={type === 'expense' ? 'active' : ''}
                            onClick={() => { setType('expense'); setCategory('') }}
                        >
                            支出
                        </button>
                        <button
                            type="button"
                            className={type === 'income' ? 'active' : ''}
                            onClick={() => { setType('income'); setCategory('') }}
                        >
                            収入
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>カテゴリ</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">選択してください</option>
                        {categories[type].map(cat => (
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
                {transactions.length === 0 ? (
                    <p className="empty">データがありません</p>
                ) : (
                    <ul>
                        {transactions.map(t => (
                            <li key={t.id} className={`transaction ${t.type}`}>
                                <div className="transaction-info">
                                    <div className="transaction-header">
                                        <span className="date">{t.date}</span>
                                        <span className="category">{t.category}</span>
                                    </div>
                                    {t.memo && <div className="memo">{t.memo}</div>}
                                </div>
                                <div className="transaction-amount">
                                    <span className={t.type}>
                                        {t.type === 'income' ? '+' : '-'}¥{t.amount.toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="delete-btn"
                                    >
                                        削除
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default App
