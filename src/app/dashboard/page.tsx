import { DashboardHeader } from "@/components/dashboard-user/dashboard-header"
import { Sidebar } from "@/components/dashboard-user/sidebar"
import { WalletConnect } from "@/components/dashboard-user/wallet-connect"
import { QuickSend } from "@/components/dashboard-user/quick-send"
import { CurrencyChart } from "@/components/dashboard-user/currency-chart"
import { RecentTransactions } from "@/components/dashboard-user/recent-transactions"
import { Footer } from "@/components/landing/footer"

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <DashboardHeader />

      {/* Main Scrollable Area */}
      <div className="h-full overflow-y-auto no-scrollbar">
        <main className="flex gap-6 p-6 pt-24 min-h-full">
          <Sidebar />

          {/* Main Content Container */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Wallet Connection */}
            <WalletConnect />

            {/* Quick Send + Currency Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickSend />
              <CurrencyChart />
            </div>

            {/* Recent Transactions */}
            <RecentTransactions />

            {/* Status Indicator */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <div className="w-[13px] h-[13px] rounded-full bg-[#86efac]" />
              <span className="text-sm text-[#919191]">Avalanche C-Chain</span>
            </div>
          </div>
        </main>
      </div>
        <Footer />
    </div>
  )
}