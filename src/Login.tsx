import { useState } from 'react'
import './Login.css'

interface LoginProps {
    onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    // パスワードのハッシュ値（SHA-256）
    // 実際のパスワード: "your-password-here"
    // 変更する場合: https://emn178.github.io/online-tools/sha256.html でハッシュ化
    const PASSWORD_HASH = '0651ee70db05737d7195776455175f3f4dbd4755e13e9f87d905a63817e979b8'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // パスワードをハッシュ化
        const encoder = new TextEncoder()
        const data = encoder.encode(password)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        if (hashHex === PASSWORD_HASH) {
            // 認証成功
            localStorage.setItem('authenticated', 'true')
            localStorage.setItem('authTime', Date.now().toString())
            onLogin()
        } else {
            // 認証失敗
            setError('パスワードが正しくありません')
            setPassword('')
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>💳 支出管理</h1>
                    <p>ログインしてください</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="password">パスワード</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setError('')
                            }}
                            placeholder="パスワードを入力"
                            autoFocus
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="login-btn">
                        ログイン
                    </button>
                </form>

                <div className="login-footer">
                    <p className="hint">
                        💡 初期パスワード: <code>your-password-here</code>
                    </p>
                    <p className="hint-small">
                        パスワードを変更する場合は、開発者に連絡してください
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
