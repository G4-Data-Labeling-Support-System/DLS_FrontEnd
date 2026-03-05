import { Outlet } from 'react-router-dom'
import { Header } from '../common/Header'
import { Footer } from '../common/Footer'
import { Sidebar } from '../common/Sidebar'

export function MainLayout() {
    return (
        <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <div className="main-container" style={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <main className="content" style={{ flex: 1, padding: '2rem' }}>
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    )
}
