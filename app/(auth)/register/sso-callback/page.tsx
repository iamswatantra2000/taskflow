import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"

export default function RegisterSSOCallback() {
  return <AuthenticateWithRedirectCallback />
}
