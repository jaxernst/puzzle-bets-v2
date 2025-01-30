import { type MUDChain, mudFoundry } from "@latticexyz/common/chains"
import { base, baseSepolia, type Chain } from "viem/chains"

export const supportedChains: Array<Chain> = [mudFoundry, baseSepolia, base]
