import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { morphHolesky } from "./chains/morph-holesky"

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id"

export const wagmiConfig = getDefaultConfig({
  appName: "TipProtocol",
  projectId,
  chains: [morphHolesky],
  ssr: true,
})
