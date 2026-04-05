"use client"

import { useEffect, useState, useCallback } from "react"

const links = [
  { label: "Features",     href: "#features"     },
  { label: "How it works", href: "#how-it-works"  },
  { label: "Pricing",      href: "#pricing"       },
]

export function NavLinks() {
  const [active, setActive]   = useState("")
  const [clicked, setClicked] = useState("")

  // Track which section is in view
  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1))
    const observers: IntersectionObserver[] = []

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(`#${id}`) },
        { threshold: 0.4 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  function handleClick(href: string, e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    setClicked(href)
    setTimeout(() => setClicked(""), 400)

    const id  = href.slice(1)
    const el  = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
      // update URL hash without jump
      history.pushState(null, "", href)
    }
  }

  return (
    <div className="hidden md:flex items-center gap-8">
      {links.map(({ label, href }) => {
        const isActive  = active === href
        const isClicked = clicked === href

        return (
          <a
            key={href}
            href={href}
            onClick={(e) => handleClick(href, e)}
            className={`
              relative text-[13px] transition-all duration-200 select-none
              ${isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-[#555] hover:text-slate-700 dark:hover:text-[#ccc]"}
              ${isClicked ? "scale-90 opacity-60" : "scale-100 opacity-100"}
            `}
            style={{ transitionProperty: "color, transform, opacity" }}
          >
            {label}
            {/* Underline indicator */}
            <span
              className={`
                absolute -bottom-1 left-0 h-px bg-indigo-500 transition-all duration-300
                ${isActive ? "w-full opacity-100" : "w-0 opacity-0"}
              `}
            />
          </a>
        )
      })}
    </div>
  )
}
