import { WalletNotConnectedError } from "@solana/wallet-adapter-base"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { useState } from "react"
import ConnectWalletButton from "@/components/connect-wallet-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Typography } from "@/components/ui/typography"
import { cn } from "@/utils/cn"
import truncate from "@/utils/truncate"

type ResultStatus = "idle" | "success" | "failed"

export default function HomePage() {
  const [receiver, setReceiver] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultStatus>("idle")
  const [signature, setSignature] = useState("")

  const { connected, publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()

  const submitTransaction = async () => {
    if (!publicKey) throw new WalletNotConnectedError()

    try {
      setLoading(true)
      setResult("idle")
      setSignature("")
      const ix = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(receiver),
        lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
      })
      const tx = new Transaction().add(ix)
      const signature = await sendTransaction(tx, connection)
      await connection.confirmTransaction(signature, "processed")
      setSignature(signature)
      setResult("success")
    } catch (error) {
      console.error(error)
      setResult("failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto my-20 flex w-full max-w-md flex-col gap-6 rounded-2xl p-6 shadow-card">
      <Typography as="h2" level="h6" className="font-bold">
        Transfer
      </Typography>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Typography level="body4" color="secondary">
            Sender
          </Typography>
          <Typography level="body4" className="font-semibold">
            {publicKey ? truncate(publicKey.toBase58(), 16, true) : "--"}
          </Typography>
        </div>
        <Input value={receiver} onChange={(event) => setReceiver(event.target.value)} placeholder="Receiver address" />
        <Input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" />
        {connected ? (
          <Button loading={loading} disabled={!receiver || !amount} onClick={submitTransaction}>
            Send
          </Button>
        ) : (
          <ConnectWalletButton />
        )}
        {result !== "idle" && (
          <div
            className={cn("rounded-xl p-4", {
              "bg-success-100 text-success-900": result === "success",
              "bg-error-100 text-error-900": result === "failed",
            })}
          >
            {result === "success" ? (
              <a
                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                target="_blank"
                className="underline"
                rel="noreferrer"
              >
                View success transaction
              </a>
            ) : (
              <p>Transaction failed</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
