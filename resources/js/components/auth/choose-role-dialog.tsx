import { useEffect, useState } from "react"
import { router } from "@inertiajs/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Truck, User } from "lucide-react"
import { cn } from "@/lib/utils"

type RoleOption = "customer" | "supplier"

interface ChooseRoleDialogProps {
  trigger?: React.ReactNode
  listenForOpenEvent?: boolean
}

const roleOptions: Array<{ value: RoleOption; label: string; description: string; icon: typeof User }> = [
  {
    value: "customer",
    label: "Customer",
    description: "I want to buy products",
    icon: User,
  },
  {
    value: "supplier",
    label: "Supplier",
    description: "I want to sell products",
    icon: Truck,
  },
]

export function ChooseRoleDialog({ trigger, listenForOpenEvent = false }: ChooseRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleOption | "">("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!listenForOpenEvent) return

    const handler = () => {
      setOpen(true)
    }

    window.addEventListener("auth:choose-role", handler)
    return () => window.removeEventListener("auth:choose-role", handler)
  }, [listenForOpenEvent])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedRole || submitting) return

    setSubmitting(true)

    router.post(
      route("choose-role.store"),
      {
        role: selectedRole,
      },
      {
        onFinish: () => setSubmitting(false),
        onSuccess: () => {
          setOpen(false)
          setSelectedRole("")
          window.location.href = route("home") as string
        },
      }
    )
  }

  const content = (
    <DialogContent className="w-full max-w-md p-6">
      <DialogHeader className="space-y-2">
        <DialogTitle>Choose your account type</DialogTitle>
        <DialogDescription>Select whether you are shopping or selling on Serdo.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-3">
          {roleOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedRole === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedRole(option.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                  isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/40"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                </span>
              </button>
            )
          })}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="submit" className="w-full rounded-full" disabled={!selectedRole || submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      {content}
    </Dialog>
  )
}

