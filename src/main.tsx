import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Statistics from './Statistics'
import Login from './Login'
import './index.css'

function Root() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // 認証状態をチェック
        const authenticated = localStorage.getItem('authenticated')
        const authTime = localStorage.getItem('authTime')

        if (authenticated === 'true' && authTime) {
            // 24時間でセッション期限切れ
            const elapsed = Date.now() - parseInt(authTime)
            const hours = elapsed / (1000 * 60 * 60)

            if (hours < 24) {
                setIsAuthenticated(true)
            } else {
                // セッション期限切れ
                localStorage.removeItem('authenticated')
                localStorage.removeItem('authTime')
            }
        }

        setIsLoading(false)
    }, [])

    const handleLogin = () => {
        setIsAuthenticated(true)
    }

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '1.5rem'
            }}>
                読み込み中...
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/statistics" element={<Statistics />} />
            </Routes>
        </BrowserRouter>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>,
)
